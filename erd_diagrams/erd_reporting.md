---
Django ER Diagram
---
erDiagram
Report {
    BigAutoField id
    CharField title
    TextField description
    DateTimeField created_at
}
SourceType {
    UUIDField id
    CharField name
}