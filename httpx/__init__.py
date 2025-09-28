"""A very small subset of the ``httpx`` API used by Starlette's TestClient.

This stub implements only the features required for synchronous testing in
restricted environments where the real dependency cannot be installed.
"""

from __future__ import annotations

import json
import io
from typing import Any, Dict, Iterable, Iterator, List, Mapping, MutableMapping, Optional, Sequence, Tuple, Union
from urllib.parse import urlencode, urljoin, urlparse, urlunparse

from . import _client, _types

URLTypes = _types.URLTypes
RequestContent = _types.RequestContent
RequestFiles = _types.RequestFiles
QueryParamTypes = _types.QueryParamTypes
HeaderTypes = _types.HeaderTypes
CookieTypes = _types.CookieTypes
AuthTypes = _types.AuthTypes
TimeoutTypes = _types.TimeoutTypes
UseClientDefault = _client.UseClientDefault
USE_CLIENT_DEFAULT = _client.USE_CLIENT_DEFAULT


class EncodedComponent:
    def __init__(self, value: str) -> None:
        self._value = value.encode("ascii") if isinstance(value, str) else value

    def decode(self, encoding: str = "ascii") -> str:
        if isinstance(self._value, bytes):
            return self._value.decode(encoding)
        return str(self._value)

    def __str__(self) -> str:  # pragma: no cover - debugging helper
        return self.decode()


class URL:
    def __init__(self, value: Union[str, "URL"]) -> None:
        if isinstance(value, URL):
            self._scheme = value.scheme
            self._netloc = value.netloc.decode()
            self._path = value.path
            self._query = value.query.decode()
            return
        parsed = urlparse(str(value))
        self._scheme = parsed.scheme or "http"
        self._netloc = parsed.netloc
        self._path = parsed.path or "/"
        self._query = parsed.query

    @property
    def scheme(self) -> str:
        return self._scheme

    @property
    def netloc(self) -> EncodedComponent:
        return EncodedComponent(self._netloc)

    @property
    def path(self) -> str:
        return self._path

    @property
    def raw_path(self) -> bytes:
        return self._path.encode("ascii")

    @property
    def query(self) -> EncodedComponent:
        return EncodedComponent(self._query)

    def join(self, other: URLTypes) -> "URL":
        return URL(urljoin(str(self), str(other)))

    def replace(self, **kwargs: Any) -> "URL":
        scheme = kwargs.get("scheme", self._scheme)
        netloc = kwargs.get("netloc", self._netloc)
        path = kwargs.get("path", self._path)
        query = kwargs.get("query", self._query)
        return URL(urlunparse((scheme, netloc, path, "", query, "")))

    def __str__(self) -> str:
        return urlunparse((self._scheme, self._netloc, self._path, "", self._query, ""))


class Headers:
    def __init__(self, data: HeaderTypes = None) -> None:
        self._items: List[Tuple[str, str]] = []
        if data:
            if isinstance(data, Mapping):
                items = data.items()
            else:
                items = data
            for key, value in items:
                self.add(key, value)

    def add(self, key: str, value: str) -> None:
        self._items.append((key, value))

    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        key_lower = key.lower()
        for existing_key, value in reversed(self._items):
            if existing_key.lower() == key_lower:
                return value
        return default

    def setdefault(self, key: str, value: str) -> str:
        existing = self.get(key)
        if existing is None:
            self.add(key, value)
            return value
        return existing

    def update(self, data: HeaderTypes) -> None:
        if not data:
            return
        if isinstance(data, Mapping):
            items = data.items()
        else:
            items = data
        for key, value in items:
            self.add(key, value)

    def multi_items(self) -> List[Tuple[str, str]]:
        return list(self._items)

    def copy(self) -> "Headers":
        return Headers(self._items)

    def __contains__(self, key: str) -> bool:  # pragma: no cover - convenience
        return self.get(key) is not None


class ByteStream:
    def __init__(self, content: bytes) -> None:
        self._buffer = io.BytesIO(content)

    def read(self) -> bytes:
        return self._buffer.read()


class BaseTransport:
    def handle_request(self, request: "Request") -> "Response":  # pragma: no cover - interface
        raise NotImplementedError


class Request:
    def __init__(
        self,
        method: str,
        url: URLTypes,
        *,
        headers: HeaderTypes = None,
        content: RequestContent = None,
    ) -> None:
        self.method = method.upper()
        self.url = URL(url)
        self.headers = Headers(headers)
        self._content = b""
        if content is None:
            self._content = b""
        elif isinstance(content, (bytes, bytearray)):
            self._content = bytes(content)
        elif isinstance(content, str):
            self._content = content.encode("utf-8")
        elif isinstance(content, Iterable):
            self._content = b"".join(bytes(chunk) if not isinstance(chunk, (bytes, bytearray)) else chunk for chunk in content)
        else:
            self._content = bytes(content)

    def read(self) -> bytes:
        return self._content


class Response:
    def __init__(
        self,
        status_code: int = 200,
        *,
        headers: HeaderTypes = None,
        content: Optional[Union[bytes, str]] = None,
        stream: Optional[ByteStream] = None,
        request: Optional[Request] = None,
        extensions: Optional[Dict[str, Any]] = None,
        reason_phrase: Optional[str] = None,
    ) -> None:
        self.status_code = status_code
        self.headers = Headers(headers)
        if stream is not None:
            body = stream.read()
        elif isinstance(content, str):
            body = content.encode("utf-8")
        elif content is None:
            body = b""
        else:
            body = bytes(content)
        self.content = body
        self.request = request
        self.extensions = extensions or {}
        self.reason_phrase = reason_phrase

    @property
    def text(self) -> str:
        return self.content.decode("utf-8")

    def json(self) -> Any:
        if not self.content:
            return None
        return json.loads(self.content.decode("utf-8"))

    def read(self) -> bytes:  # pragma: no cover - compatibility
        return self.content


class Client:
    def __init__(
        self,
        *,
        base_url: str = "http://testserver",
        headers: Optional[Dict[str, str]] = None,
        transport: Optional[BaseTransport] = None,
        follow_redirects: bool = True,
        cookies: Optional[MutableMapping[str, str]] = None,
    ) -> None:
        self.base_url = URL(base_url)
        self.headers = Headers(headers)
        self._transport = transport
        self.follow_redirects = follow_redirects
        self.cookies = cookies or {}

    def __enter__(self) -> "Client":  # pragma: no cover - compatibility
        return self

    def __exit__(self, *exc: Any) -> None:  # pragma: no cover - compatibility
        self.close()

    def close(self) -> None:  # pragma: no cover - interface compatibility
        pass

    def _merge_url(self, url: URLTypes) -> URL:
        if isinstance(url, URL):
            return url
        url_str = str(url)
        if url_str.startswith("http://") or url_str.startswith("https://") or url_str.startswith("ws://") or url_str.startswith("wss://"):
            return URL(url_str)
        return self.base_url.join(url_str)

    def _prepare_headers(self, headers: HeaderTypes) -> Headers:
        combined = self.headers.copy()
        if headers:
            combined.update(headers)
        return combined

    def request(
        self,
        method: str,
        url: URLTypes,
        *,
        content: RequestContent = None,
        data: Optional[_types.RequestData] = None,
        files: RequestFiles = None,
        json: Any = None,
        params: QueryParamTypes = None,
        headers: HeaderTypes = None,
        cookies: CookieTypes = None,
        auth: AuthTypes | UseClientDefault = USE_CLIENT_DEFAULT,
        follow_redirects: bool | UseClientDefault = USE_CLIENT_DEFAULT,
        timeout: TimeoutTypes | UseClientDefault = USE_CLIENT_DEFAULT,
        extensions: Optional[Dict[str, Any]] = None,
    ) -> Response:
        merged_url = self._merge_url(url)

        query = merged_url.query.decode()
        if params:
            if isinstance(params, Mapping):
                params_items = params.items()
            else:
                params_items = list(params)
            params_query = urlencode(list(params_items), doseq=True)
            query = "&".join(filter(None, [query, params_query]))
            merged_url = merged_url.replace(query=query)

        body: Optional[Union[bytes, str]] = None
        request_headers = self._prepare_headers(headers)
        if json is not None:
            body = json_dump(json)
            request_headers.add("content-type", "application/json")
        elif content is not None:
            body = content
        elif data is not None:
            body = urlencode(list(data.items()))
            request_headers.add("content-type", "application/x-www-form-urlencoded")

        request = Request(method, merged_url, headers=request_headers.multi_items(), content=body)
        if not self._transport:
            raise RuntimeError("A transport instance is required to send requests")
        response = self._transport.handle_request(request)
        return response

    def get(
        self,
        url: URLTypes,
        *,
        params: QueryParamTypes = None,
        headers: HeaderTypes = None,
        cookies: CookieTypes = None,
        auth: AuthTypes | UseClientDefault = USE_CLIENT_DEFAULT,
        follow_redirects: bool | UseClientDefault = USE_CLIENT_DEFAULT,
        timeout: TimeoutTypes | UseClientDefault = USE_CLIENT_DEFAULT,
        extensions: Optional[Dict[str, Any]] = None,
    ) -> Response:
        return self.request(
            "GET",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            extensions=extensions,
        )

    def post(
        self,
        url: URLTypes,
        *,
        content: RequestContent = None,
        data: Optional[_types.RequestData] = None,
        files: RequestFiles = None,
        json: Any = None,
        params: QueryParamTypes = None,
        headers: HeaderTypes = None,
        cookies: CookieTypes = None,
        auth: AuthTypes | UseClientDefault = USE_CLIENT_DEFAULT,
        follow_redirects: bool | UseClientDefault = USE_CLIENT_DEFAULT,
        timeout: TimeoutTypes | UseClientDefault = USE_CLIENT_DEFAULT,
        extensions: Optional[Dict[str, Any]] = None,
    ) -> Response:
        return self.request(
            "POST",
            url,
            content=content,
            data=data,
            files=files,
            json=json,
            params=params,
            headers=headers,
            cookies=cookies,
            auth=auth,
            follow_redirects=follow_redirects,
            timeout=timeout,
            extensions=extensions,
        )

    def put(self, url: URLTypes, **kwargs: Any) -> Response:  # pragma: no cover - unused helper
        return self.request("PUT", url, **kwargs)

    def patch(self, url: URLTypes, **kwargs: Any) -> Response:  # pragma: no cover - unused helper
        return self.request("PATCH", url, **kwargs)

    def delete(self, url: URLTypes, **kwargs: Any) -> Response:  # pragma: no cover - unused helper
        return self.request("DELETE", url, **kwargs)

    def options(self, url: URLTypes, **kwargs: Any) -> Response:  # pragma: no cover - unused helper
        return self.request("OPTIONS", url, **kwargs)


def json_dump(data: Any) -> str:
    return json.dumps(data, separators=(",", ":"), ensure_ascii=False)


__all__ = [
    "AuthTypes",
    "BaseTransport",
    "ByteStream",
    "Client",
    "CookieTypes",
    "Headers",
    "Request",
    "RequestContent",
    "RequestFiles",
    "Response",
    "TimeoutTypes",
    "URL",
    "URLTypes",
    "UseClientDefault",
    "USE_CLIENT_DEFAULT",
]
