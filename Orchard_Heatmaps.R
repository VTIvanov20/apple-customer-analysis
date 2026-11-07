# Apple Orchard: zone-constrained heatmaps, R reproducible analysis
# Put four JPEGs alongside this script and rename them as below:
# ground_clean.jpg, ground_zones.jpg, mezzanine_clean.jpg, mezzanine_zones.jpg
# install.packages(c('magick','ggplot2','dplyr','tidyr'))
library(magick)
library(ggplot2)
library(dplyr)
library(tidyr)

# Observed averages: 2 actual 10-min blocks per product category.
activity <- c(iPhone=67.5, Mac=76.5, Accessories=27.5)
# Assumed customer-activity split, NOT observed floor occupancy.
floor_share <- c(Ground=.70, Mezzanine=.30)
# Typical observed staffing, NOT fixed assignments.
staff <- list(Grou nd=c(iPhone=12,Mac=8,Accessories=1),
              Mezzanine=c(iPhone=6,Mac=5,Accessories=1))

files <- list(Ground=c(clean='ground_clean.jpg',zones='ground_zones.jpg'),
              Mezzanine=c(clean='mezzanine_clean.jpg',zones='mezzanine_zones.jpg'))

# Extract zone masks using the transparent pastel fill colors from your sketches.
# Pixel-based thresholds intentionally ignore black/white line art.
read_rgb <- function(path) {
  im <- image_read(path) |> image_convert(colorspace='sRGB')
  ar <- image_data(im, channels='rgb')
  aperm(array(as.integer(ar), dim=dim(ar)), c(3,2,1))
}

make_overlay <- function(floor, kind) {
  x <- files[[floor]]
  bg <- image_read(x[['clean']])
  rgb <- read_rgb(x[['zones']])
  if (image_info(bg)$width != dim(rgb)[2] || image_info(bg)$height != dim(rgb)[1])
    stop('The two images for ',floor,' must have identical dimensions')
  r<-rgb[,,1];g<-rgb[,,2];b<-rgb[,,3]
  masks <- list(
    Mac = (r>g+25)&(r>b+10)&(r>150),
    Accessories = (g>r+15)&(g>b+10)&(g>145),
    iPhone = (b>r+15)&(b>g+3)&(b>145)
  )
  if(any(vapply(masks,sum,numeric(1))<100)) warning('Some zone masks look small; inspect pastel color thresholds')
  values <- if(kind=='Customer activity') activity*floor_share[[floor]] else staff[[floor]]
  # Uniform value per colored zone; no invented individual coordinates.
  val <- matrix(NA_real_, nrow=dim(rgb)[1],ncol=dim(rgb)[2])
  for(nm in names(masks)) val[masks[[nm]]] <- values[[nm]]
  # Plot in pixel coordinates. Reverse y so overlay aligns with image.
  d <- as.data.frame(as.table(val)) |>
    transmute(y=as.integer(Var1),x=as.integer(Var2),intensity=Freq) |>
    filter(!is.na(intensity))
  maxval <- if(kind=='Customer activity') max(activity)*max(floor_share) else max(unlist(staff))
  p <- ggplot() + annotation_raster(as.raster(bg),xmin=0,xmax=ncol(val),ymin=0,ymax=nrow(val)) +
    geom_raster(data=d,aes(x=x,y=nrow(val)-y,fill=intensity),alpha=.68) +
    scale_fill_gradient(low='#fee8a8',high='#bc2526',limits=c(0,maxval),name=kind) +
    coord_fixed(xlim=c(0,ncol(val)),ylim=c(0,nrow(val)),expand=FALSE) +
    labs(title=paste('Apple Orchard:',floor,'—',kind),
         subtitle=if(kind=='Customer activity') 'MODELLED interaction events / 10 min; 70/30 floor split assumed' else 'Typical observed zone headcounts; mobile employees') +
    theme_void() + theme(plot.title=element_text(face='bold',size=16),legend.position='right')
  ggsave(paste0('Orchard_',floor,'_',gsub(' ','_',kind),'.png'),p,width=13,height=7,dpi=180)
  p
}

for(floor in names(files)) for(kind in c('Customer activity','Employees')) {
  actual_kind <- if(kind=='Employees') 'Employee distribution' else kind
  # The function uses anything other than 'Customer activity' for employee layer.
  print(make_overlay(floor,actual_kind))
}

# Summary of the numeric values used in the overlays
summary <- expand_grid(floor=names(floor_share),zone=names(activity)) |>
  mutate(modelled_interactions=activity[zone]*floor_share[floor],
         typical_employees=mapply(function(f,z) staff[[f]][[z]],floor,zone),
         interaction_events_per_employee=modelled_interactions/typical_employees)
write.csv(summary,'Orchard_heatmap_values.csv',row.names=FALSE)
print(summary)
