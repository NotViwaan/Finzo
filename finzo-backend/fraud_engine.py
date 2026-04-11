"""
Finzo Fraud Detection Engine
Mirrors the frontend JS rules — runs server-side for reliability.
"""

from statistics import mean, stdev


RULES = [
    {
        "id": "large_transfer",
        "label": "Unusually Large Transfer",
        "severity": "high",
        "check": lambda t, all_txns: (
            t.get("type") == "debit"
            and abs(t.get("amount", 0)) > 50_000
            and any(kw in t.get("description", "").lower()
                    for kw in ["neft", "imps", "transfer", "upi"])
        ),
    },
    {
        "id": "statistical_outlier",
        "label": "Statistical Spending Outlier",
        "severity": "medium",
        "check": lambda t, all_txns: _is_outlier(t, all_txns),
    },
    {
        "id": "unknown_payee",
        "label": "Unknown / Suspicious Payee",
        "severity": "medium",
        "check": lambda t, all_txns: (
            t.get("type") == "debit"
            and "unknown" in t.get("description", "").lower()
        ),
    },
    {
        "id": "late_night",
        "label": "Unusual Transaction Time",
        "severity": "low",
        "check": lambda t, all_txns: _is_late_night(t),
    },
    {
        "id": "round_amount",
        "label": "Suspiciously Round Amount",
        "severity": "low",
        "check": lambda t, all_txns: (
            t.get("type") == "debit"
            and abs(t.get("amount", 0)) % 10_000 == 0
            and abs(t.get("amount", 0)) >= 20_000
        ),
    },
    {
        "id": "rapid_succession",
        "label": "Multiple Transactions Same Day",
        "severity": "medium",
        "check": lambda t, all_txns: _rapid_succession(t, all_txns),
    },
    {
        "id": "balance_critical",
        "label": "Balance Dropped Critically Low",
        "severity": "high",
        "check": lambda t, all_txns: (
            t.get("balance") is not None
            and float(t.get("balance", 0)) < 500
        ),
    },
]


def _is_outlier(t: dict, all_txns: list) -> bool:
    """Flag if debit is > mean + 2*stdev of all debits."""
    if t.get("type") != "debit":
        return False
    debits = [abs(x.get("amount", 0)) for x in all_txns if x.get("type") == "debit"]
    if len(debits) < 5:
        return False
    try:
        m = mean(debits)
        s = stdev(debits)
        return abs(t.get("amount", 0)) > m + 2 * s
    except Exception:
        return False


def _is_late_night(t: dict) -> bool:
    """Flag if uploaded_at timestamp is between 00:00–05:00."""
    ts = t.get("uploaded_at", "")
    try:
        hour = int(ts[11:13])  
        return 0 <= hour < 5
    except Exception:
        return False


def _rapid_succession(t: dict, all_txns: list) -> bool:
    """Flag if ≥ 3 debits on same date."""
    if t.get("type") != "debit":
        return False
    same_day = [
        x for x in all_txns
        if x.get("date") == t.get("date") and x.get("type") == "debit"
    ]
    return len(same_day) >= 3


class FraudEngine:
    def check(self, transaction: dict, all_transactions: list) -> list[str]:
        """
        Returns list of triggered rule IDs for a transaction.
        Empty list means not flagged.
        """
        triggered = []
        for rule in RULES:
            try:
                if rule["check"](transaction, all_transactions):
                    triggered.append(rule["id"])
            except Exception:
                pass
        return triggered

    def get_rules(self) -> list:
        """Return rule metadata (without lambda functions) for the frontend."""
        return [
            {"id": r["id"], "label": r["label"], "severity": r["severity"]}
            for r in RULES
        ]
