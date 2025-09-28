from __future__ import annotations

from typing import Any, Dict, Iterable, Mapping, MutableMapping, Optional, Sequence, Tuple, Union

URLTypes = Union[str, "URL"]
RequestContent = Union[bytes, str, Iterable[bytes], None]
RequestData = MutableMapping[str, Union[str, bytes, Sequence[str], Sequence[bytes]]]
RequestFiles = Mapping[str, Any]
QueryParamTypes = Union[str, Mapping[str, Any], Sequence[Tuple[str, Any]], None]
HeaderTypes = Union[Mapping[str, str], Sequence[Tuple[str, str]], None]
CookieTypes = MutableMapping[str, str]
AuthTypes = Any
TimeoutTypes = Union[float, Tuple[float, float, float, float], None]
