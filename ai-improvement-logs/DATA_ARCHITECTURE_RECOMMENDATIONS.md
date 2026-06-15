# Data Architecture Recommendations

- Normalize shared IDs: objectiveId → CKU → commands/traps/questions.
- Build-time scanners → ai-improvement-logs/ (implemented).
- Defer pgvector/RAG until static enrichment scores 85+.

