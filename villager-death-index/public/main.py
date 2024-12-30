import os
import json

# Specify the path to your logs folder
logs_folder = "logs"

# Get a list of all files in the logs folder
log_files = []

# Walk through the directory and find all files that end with '.log'
for root, dirs, files in os.walk(logs_folder):
    for file in files:
        if file.endswith(".log"):  # Only add .log files
            log_files.append(file)

# Create a manifest object
manifest = {
    "logs": log_files
}

# Specify the output manifest file
output_file = "logs-manifest.json"

# Write the manifest to the output file
with open(output_file, "w") as f:
    json.dump(manifest, f, indent=4)

print(f"Manifest file '{output_file}' created successfully with {len(log_files)} log files.")
