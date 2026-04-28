import json
import os
import time
from pathlib import Path
from typing import Any, AsyncIterator

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient


env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DATABASE_NAME = os.getenv("DATABASE_NAME", "unbiased_ai_decision_system").strip()
LOCAL_DB_PATH = Path(__file__).resolve().parents[1] / "uploads" / "local_db.json"


def _is_local_db_forced() -> bool:
    return os.getenv("USE_LOCAL_DB", "").strip().lower() in {"1", "true", "yes"}


def _is_mongo_uri_usable(uri: str) -> bool:
    if not uri:
        return False
    if " " in uri:
        return False
    if uri.endswith("+") or "+++" in uri:
        return False
    return uri.startswith(("mongodb://", "mongodb+srv://"))


_mongo_disabled = False


def is_using_local_db() -> bool:
    return _mongo_disabled or _is_local_db_forced() or not _is_mongo_uri_usable(DATABASE_URL)


def _disable_mongo():
    global _mongo_disabled
    _mongo_disabled = True


class _Result:
    def __init__(self, inserted_id: Any = None, matched_count: int = 0):
        self.inserted_id = inserted_id
        self.matched_count = matched_count


class _LocalCursor:
    def __init__(self, docs: list[dict[str, Any]]):
        self.docs = docs

    def limit(self, count: int):
        self.docs = self.docs[:count]
        return self

    def sort(self, key_or_list, direction: int | None = None):
        if isinstance(key_or_list, list):
            key, direction = key_or_list[0]
        else:
            key = key_or_list
        reverse = direction == -1
        self.docs.sort(key=lambda item: str(item.get(key, "")), reverse=reverse)
        return self

    def __aiter__(self) -> AsyncIterator[dict[str, Any]]:
        self._index = 0
        return self

    async def __anext__(self) -> dict[str, Any]:
        if self._index >= len(self.docs):
            raise StopAsyncIteration
        item = self.docs[self._index]
        self._index += 1
        return item


class _LocalStore:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.data: dict[str, list[dict[str, Any]]] = {}
        self._load()

    def _load(self):
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                self.data = {}

    def _save(self):
        self.path.write_text(json.dumps(self.data, indent=2, default=str), encoding="utf-8")

    def collection(self, name: str) -> list[dict[str, Any]]:
        return self.data.setdefault(name, [])


_local_store = _LocalStore(LOCAL_DB_PATH)


def _match_value(actual: Any, expected: Any) -> bool:
    if isinstance(expected, dict):
        if "$in" in expected:
            return actual in expected["$in"]
        if "$exists" in expected:
            exists = actual is not None
            return exists is bool(expected["$exists"])
    return actual == expected


def _matches(doc: dict[str, Any], query: dict[str, Any] | None) -> bool:
    if not query:
        return True
    return all(_match_value(doc.get(key), expected) for key, expected in query.items())


def _apply_projection(doc: dict[str, Any], projection: dict[str, int] | None) -> dict[str, Any]:
    result = dict(doc)
    if not projection:
        result.pop("_id", None)
        return result
    for key, include in projection.items():
        if include == 0:
            result.pop(key, None)
    return result


class LocalCollection:
    def __init__(self, name: str):
        self.name = name

    async def find_one(
        self,
        query: dict[str, Any] | None = None,
        sort: list[tuple[str, int]] | None = None,
        projection: dict[str, int] | None = None,
    ):
        docs = [doc for doc in _local_store.collection(self.name) if _matches(doc, query)]
        if sort:
            key, direction = sort[0]
            docs.sort(key=lambda item: str(item.get(key, "")), reverse=direction == -1)
        if not docs:
            return None
        return _apply_projection(docs[0], projection)

    async def insert_one(self, doc: dict[str, Any]):
        stored = dict(doc)
        stored.setdefault("_id", f"local-{int(time.time() * 1000)}")
        _local_store.collection(self.name).append(stored)
        _local_store._save()
        return _Result(inserted_id=stored["_id"], matched_count=1)

    async def count_documents(self, query: dict[str, Any] | None = None):
        return sum(1 for doc in _local_store.collection(self.name) if _matches(doc, query))

    async def update_one(self, query: dict[str, Any], update: dict[str, Any]):
        for doc in _local_store.collection(self.name):
            if _matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                _local_store._save()
                return _Result(matched_count=1)
        return _Result(matched_count=0)

    def find(self, query: dict[str, Any] | None = None, projection: dict[str, int] | None = None):
        docs = [
            _apply_projection(doc, projection)
            for doc in _local_store.collection(self.name)
            if _matches(doc, query)
        ]
        return _LocalCursor(docs)


class ResilientCollection:
    def __init__(self, mongo_collection, local_collection: LocalCollection):
        self.mongo_collection = mongo_collection
        self.local_collection = local_collection

    async def _run(self, operation: str, *args, **kwargs):
        if not is_using_local_db() and self.mongo_collection is not None:
            try:
                return await getattr(self.mongo_collection, operation)(*args, **kwargs)
            except Exception:
                _disable_mongo()
                pass
        return await getattr(self.local_collection, operation)(*args, **kwargs)

    async def find_one(self, *args, **kwargs):
        return await self._run("find_one", *args, **kwargs)

    async def insert_one(self, *args, **kwargs):
        return await self._run("insert_one", *args, **kwargs)

    async def count_documents(self, *args, **kwargs):
        return await self._run("count_documents", *args, **kwargs)

    async def update_one(self, *args, **kwargs):
        return await self._run("update_one", *args, **kwargs)

    def find(self, *args, **kwargs):
        if not is_using_local_db() and self.mongo_collection is not None:
            try:
                return self.mongo_collection.find(*args, **kwargs)
            except Exception:
                _disable_mongo()
                pass
        return self.local_collection.find(*args, **kwargs)


class ResilientDatabase:
    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    def __getattr__(self, name: str) -> ResilientCollection:
        mongo_collection = None if self.mongo_db is None else self.mongo_db[name]
        return ResilientCollection(mongo_collection, LocalCollection(name))


class ResilientClient:
    def __init__(self, mongo_client):
        self.mongo_client = mongo_client
        self.admin = self

    async def command(self, command_name: str):
        if is_using_local_db() or self.mongo_client is None:
            return {"ok": 1, "local": True}
        try:
            return await self.mongo_client.admin.command(command_name)
        except Exception:
            _disable_mongo()
            return {"ok": 1, "local": True}


mongo_client = None
mongo_db = None
if _is_mongo_uri_usable(DATABASE_URL) and not _is_local_db_forced():
    mongo_client = AsyncIOMotorClient(
        DATABASE_URL,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=2000,
        connectTimeoutMS=2000,
        socketTimeoutMS=2000,
    )
    mongo_db = mongo_client[DATABASE_NAME]

client = ResilientClient(mongo_client)
db = ResilientDatabase(mongo_db)
