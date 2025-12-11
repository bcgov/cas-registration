"""
Custom Sentry transport to send events to multiple DSNs (Sentry and BetterStack).
This replaces the deprecated Hub approach with a modern transport-based solution.
"""

from typing import Any, Optional
from sentry_sdk.transport import Transport, HttpTransport


class MultiplexedTransport(Transport):
    """
    Transport that sends events to multiple DSNs simultaneously.
    Used to send events to both Sentry and BetterStack in test environment.
    """

    def __init__(self, options: dict[str, Any]) -> None:
        super().__init__(options)
        self.transports: list[HttpTransport] = []

        # Get list of DSNs from options
        dsn_list = options.get("dsn_list", [])
        if not dsn_list:
            dsn = options.get("dsn")
            if dsn:
                dsn_list = [dsn]

        # Create a transport for each DSN
        # HttpTransport requires certain options to exist (even if None)
        required_options = {
            "transport_queue_size": 100,
            "shutdown_timeout": 2.0,
            "verify_ssl": True,
            "keep_alive": True,
            "send_client_reports": True,
            "https_proxy": None,
            "http_proxy": None,
            "ca_certs": None,
            "socket_options": None,
            "cert_file": None,
            "key_file": None,
            "proxy_headers": None,
        }

        for dsn in dsn_list:
            if dsn:
                # Copy options, remove invalid ones, override DSN, and merge defaults
                transport_options = {
                    **{k: v for k, v in options.items() if k not in ("dsn_list", "integrations")},
                    **required_options,
                    "dsn": dsn,
                }
                self.transports.append(HttpTransport(transport_options))

    def capture_envelope(self, envelope: Any) -> None:
        """Send envelope to all configured transports."""
        for transport in self.transports:
            try:
                transport.capture_envelope(envelope)
            except Exception:
                # Continue sending to other transports even if one fails
                pass

    def flush(self, timeout: Optional[float] = None, callback: Optional[Any] = None) -> None:
        """Flush all transports."""
        # BaseHttpTransport.flush expects float, not Optional[float]
        # Use default timeout of 2.0 seconds (same as shutdown_timeout) when None is provided
        flush_timeout = timeout if timeout is not None else 2.0
        for transport in self.transports:
            try:
                transport.flush(flush_timeout, callback)
            except Exception:
                # Continue flushing other transports even if one fails
                pass

    def kill(self) -> None:
        """Kill all transports."""
        for transport in self.transports:
            try:
                transport.kill()
            except Exception:
                # Continue killing other transports even if one fails
                pass
