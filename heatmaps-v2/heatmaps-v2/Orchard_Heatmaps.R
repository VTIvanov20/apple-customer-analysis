# install.packages('jpeg')

CSV <- 'orchard_synthetic_coordinates.csv'
CELL <- 25
START <- 0
END <- 3600
W <- 1774; H <- 887            # simulator canvas measurement!

out <- 'R_outputs';
dir.create(out, showWarnings=FALSE)

d <- read.csv(CSV, stringsAsFactors=FALSE)

required <- c('provenance','time_seconds','agent_id','role','floor','x_px','y_px')

stopifnot(all(required %in% names(d)), CELL > 0, START <= END)

stopifnot(all(d$provenance=='synthetic'), all(is.finite(d$x_px)), all(is.finite(d$y_px)),
          all(d$x_px>=0 & d$x_px<=W), all(d$y_px>=0 & d$y_px<=H),
          all(d$floor %in% c('ground','mezzanine')), all(d$role %in% c('customer','staff')))

# =======================================================

if(anyDuplicated(d[c('time_seconds','agent_id')]))
  stop('Duplicate agent/time rows')

times <- sort(unique(d$time_seconds));

if(length(times)<2 || length(unique(diff(times)))!=1) 
  stop('Expected regularly spaced snapshots')

d <- d[d$time_seconds>=START & d$time_seconds<=END, ]

times <- sort(unique(d$time_seconds));

N <- length(times);
if(!N) stop('No snapshots selected')

# =======================================================

# The common denominator includes snapshots with zero occupants in a particular cell.
d$ix <- pmin(floor(d$x_px/CELL), ceiling(W/CELL)-1)
d$iy <- pmin(floor(d$y_px/CELL), ceiling(H/CELL)-1)

cells <- aggregate(
  list(
    samples=rep(1,nrow(d))),
    d[c('floor','role','ix','iy')],
    sum
  )

cells$mean_occupants <- cells$samples/N
write.csv(cells,file.path(out,'grid_mean_occupancy.csv'),row.names=FALSE)

summary <- aggregate(list(mean_occupants=cells$mean_occupants),cells[c('floor','role')],sum)
write.csv(summary,file.path(out,'occupancy_summary.csv'),row.names=FALSE)

print(summary)
# Convert simulator y-down coordinates once to plotting y-up coordinates.
# JPEG is placed at full canvas extent, preventing stretching or double flipping.
plot_map <- function(floor, role, vmax) {
  bg <- jpeg::readJPEG(paste0(floor,'_clean.jpg'))
  stopifnot(dim(bg)[1]==H,dim(bg)[2]==W)
  
  a <- cells[cells$floor==floor & cells$role==role,]
  palette <- colorRampPalette(if(role=='customer') c('#c4efff','#1578a8','#00334f') else c('#ffd4d5','#d65764','#651c33'))(100)
  
  par(mar=c(4,4,4,2),bg='white')
  
  plot(NA,
       xlim=c(0,W),
       ylim=c(0,H),
       asp=1,
       xaxs='i',
       yaxs='i',
       axes=FALSE,
       xlab='Simulator X (pixels)',
       ylab='Simulator Y (pixels; top-left origin)',
       main=paste('Orchard',floor,'- Heatmap',role,'occupancy'))
  
  rasterImage(bg,0,0,W,H,interpolate=FALSE)
  
  if(nrow(a)) {
    cols <- palette[pmax(1,pmin(100,ceiling(a$mean_occupants/vmax*100)))]
    
    rect(
      a$ix*CELL,
      H-pmin((a$iy+1)*CELL,H),
      pmin((a$ix+1)*CELL,W),
      H-a$iy*CELL,
        col=adjustcolor(cols,alpha.f=.75),
        border=NA
      )
  }
  
  axis(1,at=seq(0,W,200));
  
  axis(2,at=H-seq(0,H,100),
       labels=seq(0,H,100),
       las=1
  )
  
  abline(v=seq(0,W,100),
         h=H-seq(0,H,100),
         col='#55555522',
         lty=3
  )
  
  legend('bottom',
         legend=sprintf('%.2f',seq(0,vmax,length.out=5)),
         fill=palette[round(seq(1,100,length.out=5))],
         horiz=TRUE,
         bty='n',
         title=paste('Mean occupants /',CELL,'by',CELL,'px cell; same scale on both floors'),cex=.8
  )
  
  mtext(sprintf('SYNTHETIC | %.1f to %.1f min | %d snapshots ',min(times)/60,max(times)/60,N),side=3,line=.2,cex=.75)
}
for(role in c('customer','staff')) {
  
 vmax <- max(cells$mean_occupants[cells$role==role],0); if(vmax==0) vmax<-1
 
 for(floor in c('ground','mezzanine')) {
  png(
    file.path(
      out,paste0(floor,'_',role,'.png')
    ),
    width=2200,
    height=1200,
    res=160
  )

  plot_map(floor,role,vmax); dev.off()
 }
 
 pdf(
   file.path(
      out,
      paste0(role,'_both_floors.pdf')
    ), width=14, height=15
   )
 
 par(mfrow=c(2,1)); for(floor in c('ground','mezzanine')) plot_map(floor,role,vmax); dev.off()
 
}