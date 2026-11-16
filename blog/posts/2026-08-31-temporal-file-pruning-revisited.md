---
title: Temporal Pruning for Vector Search
date: 2026-08-31
excerpt: A dive into embedding timestamp metadata in Parquet file footers, and its implications for write amplification.
---

This entry details my experience working on my final project for CSE 584 at the University of Michigan. I'll walk through how I got interested in this problem, why I chose to extend the specific library I worked on, and some lessons I learned along the way.

## Background

I'll preface by mentioning this was a seminar-style class—no programming assignments. Course activities boiled down to reading papers, evaluating their results, thinking through tradeoffs, with a couple of industry lectures from some high-profile folks working at the edge of the industry towards the end of the semester. I had the opportunity to learn about many interesting topics in databases I hadn't been exposed to before, namely column-oriented engines, disaggregation of storage and compute, and niche data representation techniques tailored for _very_ specific access patterns.

Naturally, I came to learn about vector search, and vectorization in general through two assigned readings—the MonetDB/X100 engine and an evaluation of HNSW for efficient ANN.

## Observations



## The setup

Each partition covers a fixed window. A query like `WHERE ts BETWEEN '2026-01-01' AND '2026-02-01'` should only ever touch the files whose footer range overlaps it:

```
fn should_scan(file: &FileFooter, query_range: &TimeRange) -> bool {
    file.ts_min <= query_range.end && file.ts_max >= query_range.start
}
```

On the benchmark set this took wall-clock time from 4.1s to 0.49s — an 8.3x speedup — at the cost of a slightly heavier write path to compute and store the footer range.

> The full writeup, including the write-amplification tradeoffs, is in the project report.

Read the [full report](https://github.com/mohammadnaqvi04/pq-vector/blob/feat/multi-pq-search/Temporal_File_Pruning_for_Vector_Search_over_Time_Partitioned_Parquet_Files.pdf) or the [source](https://github.com/mohammadnaqvi04/pq-vector/tree/feat/multi-pq-search).
