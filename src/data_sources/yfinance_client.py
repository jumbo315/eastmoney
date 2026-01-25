"""
yFinance Client for US Market Data
Provides reliable data for US market indices (Dow Jones, NASDAQ, S&P 500).
"""

import yfinance as yf
from typing import Dict, Optional
from datetime import datetime, timedelta
import pandas as pd


# US Market Index Symbols
US_INDICES = {
    '道琼斯': '^DJI',      # Dow Jones Industrial Average
    '纳斯达克': '^IXIC',   # NASDAQ Composite
    '标普500': '^GSPC',    # S&P 500
}


def get_us_market_data() -> Dict:
    """
    Get real-time US market overview for Dow Jones, NASDAQ, and S&P 500.

    Returns:
        Dict mapping index name (Chinese) to market data
    """
    result = {}

    for name_cn, symbol in US_INDICES.items():
        try:
            ticker = yf.Ticker(symbol)

            # Get current data (fast_info for quick access)
            try:
                # Try fast_info first (faster)
                info = ticker.fast_info
                last_price = info.get('lastPrice')
                prev_close = info.get('previousClose')
            except:
                # Fallback to full info
                info = ticker.info
                last_price = info.get('regularMarketPrice') or info.get('currentPrice')
                prev_close = info.get('regularMarketPreviousClose') or info.get('previousClose')

            # Calculate change
            change_amount = None
            change_percent = None

            if last_price and prev_close:
                change_amount = last_price - prev_close
                change_percent = (change_amount / prev_close) * 100

            # Get today's range
            try:
                day_high = info.get('dayHigh') or info.get('regularMarketDayHigh')
                day_low = info.get('dayLow') or info.get('regularMarketDayLow')
                day_open = info.get('open') or info.get('regularMarketOpen')
            except:
                day_high = None
                day_low = None
                day_open = None

            # Format result in AkShare-compatible format
            result[name_cn] = {
                '最新价': round(last_price, 2) if last_price else 'N/A',
                '涨跌额': round(change_amount, 2) if change_amount else 'N/A',
                '涨跌幅': f"{change_percent:.2f}%" if change_percent is not None else 'N/A',
                '开盘价': round(day_open, 2) if day_open else 'N/A',
                '最高价': round(day_high, 2) if day_high else 'N/A',
                '最低价': round(day_low, 2) if day_low else 'N/A',
                '更新时间': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

        except Exception as e:
            print(f"Error fetching yFinance data for {name_cn} ({symbol}): {e}")
            result[name_cn] = {
                '最新价': 'N/A',
                '涨跌额': 'N/A',
                '涨跌幅': 'N/A',
                '说明': '数据暂时无法获取'
            }

    return result if result else {"说明": "美股数据暂时无法获取"}


def get_us_market_history(symbol: str, period: str = "5d") -> Optional[pd.DataFrame]:
    """
    Get historical data for a US market index.

    Args:
        symbol: yFinance ticker symbol (e.g., '^DJI', '^IXIC', '^GSPC')
        period: Time period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')

    Returns:
        DataFrame with OHLCV data
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)

        if df is not None and not df.empty:
            # Normalize column names to lowercase
            df.columns = df.columns.str.lower()
            return df

    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")

    return None


def get_us_index_by_name(name_cn: str) -> Optional[Dict]:
    """
    Get current data for a specific US index by Chinese name.

    Args:
        name_cn: Chinese name ('道琼斯', '纳斯达克', '标普500')

    Returns:
        Dict with market data for the index
    """
    data = get_us_market_data()
    return data.get(name_cn)


def test_yfinance_connection() -> bool:
    """
    Test yFinance connection by fetching S&P 500 data.

    Returns:
        True if successful, False otherwise
    """
    try:
        ticker = yf.Ticker('^GSPC')
        info = ticker.fast_info

        last_price = info.get('lastPrice')

        if last_price:
            print(f"✅ yFinance connection successful! S&P 500: {last_price}")
            return True
        else:
            print("❌ yFinance connection failed: No price data")
            return False

    except Exception as e:
        print(f"❌ yFinance connection failed: {e}")
        return False


def get_dow_jones() -> Dict:
    """Get Dow Jones Industrial Average data."""
    return get_us_index_by_name('道琼斯') or {}


def get_nasdaq() -> Dict:
    """Get NASDAQ Composite data."""
    return get_us_index_by_name('纳斯达克') or {}


def get_sp500() -> Dict:
    """Get S&P 500 data."""
    return get_us_index_by_name('标普500') or {}


if __name__ == "__main__":
    # Test connection
    print("Testing yFinance connection...")
    test_yfinance_connection()

    # Test US market data fetch
    print("\nFetching US market overview...")
    data = get_us_market_data()

    for index_name, index_data in data.items():
        print(f"\n{index_name}:")
        for key, value in index_data.items():
            print(f"  {key}: {value}")

    # Test historical data
    print("\nFetching S&P 500 5-day history...")
    hist = get_us_market_history('^GSPC', period='5d')
    if hist is not None and not hist.empty:
        print(f"✅ Fetched {len(hist)} days of data")
        print(hist[['close']].tail())
    else:
        print("❌ Failed to fetch historical data")
