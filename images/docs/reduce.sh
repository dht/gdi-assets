#!/bin/bash

for i in {1..23}; do
    input_file="${i}.png"
    output_file="${i}_s.png"

    # Check if the input file exists
    if [ -e "$input_file" ]; then
        convert "$input_file" -depth 8 "$output_file"
        echo "Converted $input_file to $output_file"
    else
        echo "File $input_file does not exist."
    fi
done
