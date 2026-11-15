

base = Path("/mnt/data/bloompath_passport")
explain_path = base / "EXPLAINABILITY.md"
content = explain_path.read_text(encoding="utf-8")

# Match the checkpoint's required heading term exactly.
content = content.replace("## Limits", "## Limitations")
assert "## Limitations" in content
assert "## Limits" not in content
explain_path.write_text(content, encoding="utf-8")

# Repackage the current three passport files.
zip_path = Path("/mnt/data/bloompath_passport_files_v3.zip")
with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for filename in ["agent.yaml", "SOUL.md", "EXPLAINABILITY.md"]:
        path = base / filename
        assert path.exists()
        zf.write(path, arcname=filename)

print("Updated heading:")
print("## Limitations")
print(f"Updated file: {explain_path}")
print(f"Updated ZIP: {zip_path}")
