Apple Orchard spatial heatmaps (R)

Place Orchard_Heatmaps.R in the same folder as these four JPEG files, renamed:
- ground_clean.jpg: first Orchard ground floor image (black/white)
- ground_zones.jpg: second Orchard ground floor image (colored)
- mezzanine_clean.jpg: third Orchard mezzanine image (black/white)
- mezzanine_zones.jpg: fourth Orchard mezzanine image (colored)

Run in RStudio with the working directory set to that folder:
source('Orchard_Heatmaps.R')

The script generates four overlaid PNGs and a CSV of the underlying values.
Customer layer: interaction events averaged from the two direct observations per zone, allocated 70% ground / 30% mezzanine by assumption. NOT measured customer density.
Employee layer: typical observed staff headcounts by zone and floor. NOT individual employee positions.
Uniform fill within zones is deliberate. No point-level observations were collected, so kernel-density estimation would create misleading precision.
