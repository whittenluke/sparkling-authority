On product pages:
┌──────────────────────────────┐
│ Carbonation        10        │
├──────────────────────────────┤
│ Intensity          High      │
│ Bubble Size        Medium    │
│ Persistence        Long      │
└──────────────────────────────┘

##Mapping

- Intensity is derived from carbonation_level, not stored separately:
   - 1-2 → Low
   - 3-4 → Medium-Low
   - 5 → Medium
   - 6-7 → Medium-High
   - 8-10 → High 

- Bubble Size
    Stored values:
      - Small
      - Medium
      - Large

- Persistence
    Stored values:
      - Short
      - Moderate
      - Long

Give me the SQL queries to copy/paste into Supabase, based on schema.sql patterns in my documentation to:
- "Bubble Size" needs to be added as a column on the products table
- "Persistence" needs to be added as a column on the products table

The UI displays carbonation level, intensity (single word), and optional bubble size/persistence as 3-segment controls (all options visible, current value highlighted).

