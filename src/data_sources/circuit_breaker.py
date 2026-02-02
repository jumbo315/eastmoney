"""
Circuit Breaker pattern for TuShare Pro API resilience.

Prevents cascading failures by temporarily disabling failing APIs
and automatically attempting recovery.

States:
- CLOSED: Normal operation (API calls allowed)
- OPEN: Failure threshold exceeded (API calls blocked, use fallback)
- HALF_OPEN: Testing recovery (allow limited calls to test if API recovered)

Author: TuShare Migration Phase 5
Date: 2026-01-24
"""

import time
from enum import Enum
from typing import Optional
from src.cache.cache_manager import cache_manager


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"           # Normal operation
    OPEN = "open"               # Failing, use fallback
    HALF_OPEN = "half_open"     # Testing recovery


class CircuitBreaker:
    """
    Circuit breaker pattern for API resilience.

    Opens after repeated failures to prevent cascading issues.
    Automatically attempts recovery after timeout period.

    Attributes:
        failure_threshold: Number of failures before opening circuit
        timeout: Seconds to wait before attempting recovery
        cache_prefix: Prefix for cache keys
    """

    def __init__(self, failure_threshold: int = 5, timeout: int = 300):
        """
        Initialize circuit breaker.

        Args:
            failure_threshold: Failures needed to open circuit (default: 5)
            timeout: Seconds to stay open before trying half-open (default: 300)
        """
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.cache_prefix = "circuit_breaker:"

    def is_open(self, api_name: str) -> bool:
        """
        Check if circuit is open (should use fallback).

        Args:
            api_name: Name of the API to check

        Returns:
            True if circuit is open (API unavailable), False otherwise
        """
        state = self._get_state(api_name)

        if state == CircuitState.OPEN:
            # Check if timeout expired
            open_time = cache_manager.get(f"{self.cache_prefix}{api_name}:open_time")
            if open_time and time.time() - open_time > self.timeout:
                # Move to half-open state (allow test call)
                self._set_state(api_name, CircuitState.HALF_OPEN)
                print(f"🟡 Circuit breaker HALF-OPEN for {api_name} (testing recovery)")
                return False
            return True

        return False

    def record_success(self, api_name: str):
        """
        Record successful API call.

        Resets circuit to CLOSED state and clears failure count.

        Args:
            api_name: Name of the API
        """
        current_state = self._get_state(api_name)

        # If recovering from HALF_OPEN, log success
        if current_state == CircuitState.HALF_OPEN:
            print(f"✅ Circuit breaker CLOSED for {api_name} (recovery successful)")

        # Reset to closed state
        self._set_state(api_name, CircuitState.CLOSED)
        cache_manager.delete(f"{self.cache_prefix}{api_name}:failures")
        cache_manager.delete(f"{self.cache_prefix}{api_name}:open_time")

    def record_failure(self, api_name: str):
        """
        Record failed API call.

        Opens circuit if failure threshold exceeded.

        Args:
            api_name: Name of the API
        """
        current_state = self._get_state(api_name)

        # If in HALF_OPEN and failed, immediately reopen
        if current_state == CircuitState.HALF_OPEN:
            self._set_state(api_name, CircuitState.OPEN)
            cache_manager.set(
                f"{self.cache_prefix}{api_name}:open_time",
                time.time(),
                ttl=self.timeout + 60
            )
            print(f"🔴 Circuit breaker REOPENED for {api_name} (recovery failed)")
            return

        # Increment failure count
        failures_key = f"{self.cache_prefix}{api_name}:failures"
        failures = cache_manager.get(failures_key) or 0
        failures += 1
        cache_manager.set(failures_key, failures, ttl=3600)

        # Open circuit if threshold exceeded
        if failures >= self.failure_threshold:
            self._set_state(api_name, CircuitState.OPEN)
            cache_manager.set(
                f"{self.cache_prefix}{api_name}:open_time",
                time.time(),
                ttl=self.timeout + 60
            )
            print(f"🔴 Circuit breaker OPENED for {api_name} (failures: {failures})")

    def get_status(self, api_name: str) -> dict:
        """
        Get circuit breaker status for an API.

        Args:
            api_name: Name of the API

        Returns:
            Dictionary with circuit status information
        """
        state = self._get_state(api_name)
        failures = cache_manager.get(f"{self.cache_prefix}{api_name}:failures") or 0
        open_time = cache_manager.get(f"{self.cache_prefix}{api_name}:open_time")

        status = {
            'api_name': api_name,
            'state': state.value,
            'failures': failures,
            'failure_threshold': self.failure_threshold,
            'is_open': state == CircuitState.OPEN
        }

        if open_time:
            time_since_open = time.time() - open_time
            time_until_halfopen = max(0, self.timeout - time_since_open)
            status['time_since_open'] = time_since_open
            status['time_until_halfopen'] = time_until_halfopen

        return status

    def reset(self, api_name: str):
        """
        Manually reset circuit breaker for an API.

        Args:
            api_name: Name of the API to reset
        """
        self._set_state(api_name, CircuitState.CLOSED)
        cache_manager.delete(f"{self.cache_prefix}{api_name}:failures")
        cache_manager.delete(f"{self.cache_prefix}{api_name}:open_time")
        print(f"🔄 Circuit breaker RESET for {api_name}")

    def _get_state(self, api_name: str) -> CircuitState:
        """Get current circuit state from cache."""
        state = cache_manager.get(f"{self.cache_prefix}{api_name}:state")
        return CircuitState(state) if state else CircuitState.CLOSED

    def _set_state(self, api_name: str, state: CircuitState):
        """Set circuit state in cache."""
        cache_manager.set(
            f"{self.cache_prefix}{api_name}:state",
            state.value,
            ttl=3600
        )


# Global instance
circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=300)
