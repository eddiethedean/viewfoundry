"""Sphinx configuration for ViewFoundry documentation."""

from __future__ import annotations

import os
from datetime import datetime

project = "ViewFoundry"
author = "ViewFoundry contributors"
copyright = f"{datetime.now().year}, {author}"
release = "0.2.0"
version = "0.2.0"

extensions = [
    "myst_parser",
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store", "requirements.txt"]

html_theme = "sphinx_rtd_theme"
html_static_path = ["_static"]
html_css_files = ["custom.css"]
html_title = "ViewFoundry"
html_short_title = "ViewFoundry"

myst_heading_anchors = 3
myst_enable_extensions = [
    "colon_fence",
    "deflist",
    "html_admonition",
]

pygments_style = "sphinx"

# Allow RTD theme version switcher when hosted on Read the Docs
if os.environ.get("READTHEDOCS"):
    html_context = {
        "display_github": True,
        "github_user": "eddiethedean",
        "github_repo": "viewfoundry",
        "github_version": "main",
        "conf_py_path": "/apps/docs/",
    }
