# Bible Passage Slide Generator

## Overview

This project automates the generation of Bible passage slides for worship services using:

* Google Apps Script (GAS)
* Google Slides
* Google Sheets
* Static JSON Bible libraries
* Optional AI providers (Gemini, DeepSeek, ChatGPT, etc.)

The goal is to reduce manual work when preparing worship presentation slides while still supporting:

* Chinese slides
* English slides
* Bilingual slides
* Large / Medium / Small font layouts
* Partial verse support (`a` / `b`)
* Automatic slide splitting
* Consecutive verse packing
* Consecutive chapter support
* Google Slides automation

This project is an enhanced evolution of the original slide_src project, adding AI-powered Bible passage extraction, improved multilingual processing, smarter slide formatting logic, and significantly more advanced automation capabilities. The original project provided only a more rudimentary implementation of Bible passage extraction and did not support AI integration.

---

# Main Features

## 1. Automatic Bible Passage Extraction

The system can extract Bible passages from:

* Local static JSON Bible libraries (preferred for reliability)
* AI providers (optional)

Supported formats:

* `創世記 1:1-5`
* `創世記 1:1-2:3`
* `創世記 1:1a-2b`
* Multiple passages separated by `;`

Example:

```text
創世記 1:1-5; 詩篇 23:1-6
```

---

# 2. Language Modes

Supported slide output modes:

| Mode                    | Description             |
| ----------------------- | ----------------------- |
| `chinese`               | Chinese only slides     |
| `english`               | English only slides     |
| `bilingualChineseFirst` | Chinese displayed first |
| `bilingualEnglishFirst` | English displayed first |

---

# 3. Smart Bilingual Slide Packing

The system intelligently packs multiple short verse pairs into a single slide.

Example:

```text
CN Verse 1
CN Verse 2
EN Verse 1
EN Verse 2
```

If a verse pair becomes too large:

* It automatically spills across multiple slides
* It dynamically splits long content
* It avoids breaking English words whenever possible

---

# 4. Font Profiles

Three font profiles are supported:

| Font Profile | Approximate Font Size |
| ------------ | --------------------- |
| `large`      | 50                    |
| `medium`     | 40                    |
| `small`      | 30                    |

Each profile has its own:

* Maximum characters per line
* Maximum lines per slide

This allows:

* Large sanctuary screens
* Medium classroom displays
* Dense study presentation layouts

---

# 5. Partial Verse Support

Supports partial verses such as:

* `John 3:16a`
* `John 3:16b`
* `John 3:16a-17b`

The system can:

* Detect partial verses
* Split verses intelligently
* Preserve formatting

---

# 6. Consecutive Chapter Support

Supports passages spanning multiple chapters.

Examples:

```text
John 3:16-4:5
創世記 1:30-2:3
```

This is an important feature because many commercial presentation tools have limited support for:

* Consecutive chapter extraction
* Multi-chapter bilingual formatting
* Automatic overflow handling

---

# 7. Automatic Google Slides Generation

The workflow:

1. User selects passage from HTML sidebar
2. System extracts verses
3. Slides are generated automatically
4. Text is inserted into Google Slides
5. Formatting and layout are applied

The entire process is designed to minimize manual editing.

---

# Architecture

## Main Components

| Component            | Purpose                   |
| -------------------- | ------------------------- |
| HTML Sidebar         | User interface            |
| Google Apps Script   | Main logic engine         |
| Google Sheets        | Intermediate workflow     |
| Google Slides        | Final presentation output |
| JSON Bible Libraries | Stable verse source       |
| AI Providers         | Optional verse extraction |

---

# Key Functions

## `passageCapture()`

Responsible for:

* Parsing Bible references
* Loading verses
* AI fallback handling
* Partial verse processing

Features:

* JSON Bible primary mode
* AI extraction mode
* Automatic JSON fallback if AI fails

---

## `mergeBilingualSlides()`

Responsible for:

* Packing bilingual verses
* Smart slide splitting
* Overflow handling
* Long verse continuation
* English-first / Chinese-first ordering

---

## `splitChunkByLines()`

Responsible for:

* Dynamic overflow splitting
* Avoiding English word breaks
* Smart text chunking

---

## `extractMultiLanguagePassage()`

Responsible for:

* Coordinating passage extraction
* Calling language-specific capture routines
* Inserting generated slides into Sheets

---

# Reliability Design

## JSON Bible Fallback

If AI extraction fails:

* Empty reply
* API timeout
* JSON parse failure
* Invalid AI response

The system automatically falls back to the local JSON Bible.

This dramatically improves reliability during worship preparation.

---

# Commercial Product Comparison

## Common Commercial Tools

Popular worship presentation tools include:

* EasyWorship
* ProPresenter
* MediaShout
* OpenLP
  n- WorshipTools Presenter

---

# Strengths of Commercial Products

Commercial worship tools usually provide:

* Live presentation control
* Video playback
* Stage display support
* MIDI integration
* Live streaming integration
* Audience display features
* Song database management
* Multi-screen output

These products are excellent for:

* Real-time worship operation
* Live service presentation
* Media playback
* Volunteer-friendly operation

---

# Limitations of Commercial Products

Many commercial products have limitations when handling:

* Complex bilingual formatting
* Chinese + English mixed slides
* Consecutive chapter extraction
* Partial verse support (`a` / `b`)
* Highly customized slide layouts
* Automatic intelligent verse packing
* AI-assisted workflows
* Google Slides integration

Some tools support Bible importing, but:

* Layout customization can be limited
* Multi-chapter extraction may require manual adjustment
* Bilingual overflow handling is often manual

---

# Advantages of This Project

This project focuses specifically on:

* Worship preparation automation
* Google ecosystem integration
* Chinese/English bilingual optimization
* Smart slide layout generation
* Automated overflow handling
* Flexible custom logic
* AI extensibility

It is especially useful for churches that:

* Already use Google Workspace
* Need bilingual worship support
* Want highly customized layouts
* Need automation for weekly preparation

---

# Example Workflow

## Step 1

Open the HTML sidebar.

---

## Step 2

Select:

* Language mode
* Font profile
* Bible book
* Chapter and verse range

---

## Step 3

Click `Submit`.

---

## Step 4

The system:

* Extracts passages
* Packs verses into slides
* Splits overflow automatically
* Inserts results into Google Slides

---

# Example Passage Inputs

```text
創世記 1:1-5
John 3:16-18
詩篇 23:1-6
創世記 1:1a-2b
```

---

# Future Improvements

Potential future enhancements:

* More Bible translations
* Better AI verse cleanup
* Verse caching
* Auto-pagination preview
* PowerPoint export
* Theme templates
* Song lyric integration
* Sermon note integration
* Web app deployment

---

# Notes About AI Usage

AI providers are optional.

The recommended production mode is:

```text
usingJSONBible = true
```

because:

* It is deterministic
* Faster
* More reliable
* No API dependency
* No hallucination risk

AI mode is useful for:

* Experimental workflows
* Specialized parsing
* Future smart formatting

---

# Recommended Environment

* Google Apps Script
* Google Workspace
* Google Slides
* Google Sheets
* Modern Chromium browser

---

# License

This project is intended primarily for church and ministry usage.

Please adapt and customize according to your ministry needs.

