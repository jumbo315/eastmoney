"""
Rate Limiter for TuShare Pro API calls.

Uses sliding window algorithm to enforce TuShare rate limits:
- Free tier: 120 calls/minute
- Conservative limit: 100 calls/minute (20% buffer)

Author: TuShare Migration Phase 5
Date: 2026-01-24
"""

import time
from collections import deque
from threading import Lock
from typing import Optional


class RateLimiter:
    """
    Sliding window rate limiter for TuShare API calls.

    Prevents exceeding TuShare's per-minute call limits by tracking
    API calls in a time-based sliding window.

    Attributes:
        max_calls: Maximum calls allowed per window (default: 100)
        window_seconds: Time window in seconds (default: 60)
        calls: Deque of timestamp records
        lock: Thread lock for concurrent access
    """

    def __init__(self, max_calls: int = 100, window_seconds: int = 60):
        """
        Initialize rate limiter.

        Args:
            max_calls: Maximum calls per window (default 100, leaving 20% buffer)
            window_seconds: Time window in seconds (default 60)
        """
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self.calls = deque()
        self.lock = Lock()

    def acquire(self, api_name: Optional[str] = None) -> bool:
        """
        Attempt to acquire permission for an API call.

        Args:
            api_name: Optional API name for logging purposes

        Returns:
            True if call is allowed, False if rate limit exceeded
        """
        with self.lock:
            now = time.time()

            # Remove calls outside the sliding window
            while self.calls and self.calls[0] < now - self.window_seconds:
                self.calls.popleft()

            # Check if we can make another call
            if len(self.calls) < self.max_calls:
                self.calls.append(now)
                return True
            else:
                # Calculate wait time until oldest call expires
                oldest_call = self.calls[0]
                wait_time = (oldest_call + self.window_seconds) - now
                if api_name:
                    print(f"⚠️  Rate limit reached for {api_name}. Wait {wait_time:.1f}s")
                else:
                    print(f"⚠️  Rate limit reached. Wait {wait_time:.1f}s")
                return False

    def wait_if_needed(self, api_name: Optional[str] = None):
        """
        Block until we can make a call (with automatic wait).

        Args:
            api_name: Optional API name for logging purposes
        """
        while not self.acquire(api_name):
            time.sleep(0.5)  # Sleep briefly and retry

    def get_current_usage(self) -> dict:
        """
        Get current rate limiter statistics.

        Returns:
            Dictionary with usage statistics
        """
        with self.lock:
            now = time.time()

            # Clean expired calls
            while self.calls and self.calls[0] < now - self.window_seconds:
                self.calls.popleft()

            calls_in_window = len(self.calls)
            remaining = self.max_calls - calls_in_window

            return {
                'calls_in_window': calls_in_window,
                'remaining': remaining,
                'max_calls': self.max_calls,
                'window_seconds': self.window_seconds,
                'utilization_pct': (calls_in_window / self.max_calls * 100) if self.max_calls > 0 else 0
            }

    def reset(self):
        """Reset the rate limiter (clear all tracked calls)."""
        with self.lock:
            self.calls.clear()


# Global instance (100 calls/min with 60s window)
rate_limiter = RateLimiter(max_calls=100, window_seconds=60)
