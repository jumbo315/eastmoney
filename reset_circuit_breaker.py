#!/usr/bin/env python3
"""
Circuit Breaker Reset Tool

Use this tool to manually reset circuit breakers when they are stuck in OPEN state.

Usage:
    python reset_circuit_breaker.py [api_name]

    # Reset all circuit breakers
    python reset_circuit_breaker.py --all

    # Reset specific API
    python reset_circuit_breaker.py moneyflow

Examples:
    python reset_circuit_breaker.py moneyflow
    python reset_circuit_breaker.py anns
    python reset_circuit_breaker.py --all
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_sources.circuit_breaker import circuit_breaker


def reset_api(api_name: str):
    """Reset circuit breaker for a specific API"""
    print(f"🔄 Resetting circuit breaker for '{api_name}'...")

    # Get status before reset
    status = circuit_breaker.get_status(api_name)
    print(f"  Before: {status['state'].upper()} (failures: {status['failures']})")

    # Reset
    circuit_breaker.reset(api_name)

    # Get status after reset
    status_after = circuit_breaker.get_status(api_name)
    print(f"  After:  {status_after['state'].upper()} (failures: {status_after['failures']})")
    print(f"✅ Circuit breaker for '{api_name}' reset successfully!")


def reset_all():
    """Reset all known circuit breakers"""
    known_apis = [
        'anns',           # Announcements
        'concept_detail',  # Industry flow
        'ths_index',      # THS sector index
        'fx_daily',       # Forex
        'moneyflow',      # Money flow (deprecated but might be in cache)
        'index_daily',    # Market indices
    ]

    print("🔄 Resetting ALL circuit breakers...")
    print()

    for api_name in known_apis:
        try:
            status = circuit_breaker.get_status(api_name)
            if status['state'] != 'closed':
                print(f"  {api_name.ljust(20)}: {status['state'].upper()} → ", end='')
                circuit_breaker.reset(api_name)
                print("CLOSED ✅")
            else:
                print(f"  {api_name.ljust(20)}: CLOSED (no action needed)")
        except Exception as e:
            print(f"  {api_name.ljust(20)}: Error - {e}")

    print()
    print("✅ All circuit breakers reset!")


def show_status():
    """Show status of all circuit breakers"""
    known_apis = [
        'anns',
        'concept_detail',
        'ths_index',
        'fx_daily',
        'moneyflow',
        'index_daily',
    ]

    print("\n" + "=" * 80)
    print("  Circuit Breaker Status")
    print("=" * 80)
    print()

    for api_name in known_apis:
        try:
            status = circuit_breaker.get_status(api_name)
            state_emoji = "🟢" if status['state'] == 'closed' else "🔴" if status['state'] == 'open' else "🟡"

            print(f"  {state_emoji} {api_name.ljust(20)}: {status['state'].upper().ljust(10)} "
                  f"(failures: {status['failures']}/{status['failure_threshold']})")

            if 'time_until_halfopen' in status and status['state'] == 'open':
                print(f"     → Will retry in {status['time_until_halfopen']:.0f}s")
        except Exception as e:
            print(f"  ⚪ {api_name.ljust(20)}: N/A ({e})")

    print()


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description='Circuit Breaker Management Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --status              Show status of all circuit breakers
  %(prog)s --all                 Reset all circuit breakers
  %(prog)s moneyflow             Reset moneyflow circuit breaker
  %(prog)s anns                  Reset anns circuit breaker
        """
    )

    parser.add_argument('api_name', nargs='?', help='API name to reset (e.g., moneyflow, anns)')
    parser.add_argument('--all', action='store_true', help='Reset all circuit breakers')
    parser.add_argument('--status', action='store_true', help='Show status of all circuit breakers')

    args = parser.parse_args()

    # Show status
    if args.status:
        show_status()
        return

    # Reset all
    if args.all:
        reset_all()
        return

    # Reset specific API
    if args.api_name:
        reset_api(args.api_name)
        return

    # No arguments - show help and status
    parser.print_help()
    show_status()


if __name__ == "__main__":
    main()
