# RewriteFlow 🚀

> Advanced AI-Powered Text Refinement & DAG Workflow Orchestration Platform.

[![Python Engine](https://img.shields.io/badge/Engine-Python%203.11-blue)](https://python.org)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2020-green)](https://nodejs.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-amber)](LICENSE)

## Overview

RewriteFlow is an enterprise-grade text transformation platform combining a modular Python DAG node engine, real-time SSE streaming backend, and an interactive React visual node editor canvas.

## Features

- ⚙️ **Modular Python DAG Engine**: Extensible node architecture (`GrammarFixNode`, `ToneShiftNode`, `ParaphraseNode`, `SummarizeNode`, `SimplifierNode`, `SEOOptimizerNode`, `StyleTransferNode`).
- 🎨 **Visual Node Editor**: Interactive drag-and-drop React canvas with live side-by-side diff comparison and tone sliders.
- ⚡ **Real-Time Streaming**: Server-Sent Events (SSE) streaming execution updates.
- 📊 **Quality & Readability Metrics**: Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, and vector similarity calculation.
- 🛠️ **CLI & Presets**: Declarative YAML workflows and benchmarking suite.

## Quick Start

```bash
# Clone repository
git clone https://github.com/shan3520/rewriteflow.git

# Run Python Engine Tests
python -m unittest discover tests

# Start Docker Cluster
docker-compose up --build
```
