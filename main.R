library(tidyverse)

observations <- tribble(
  ~store, ~interval, ~zone, ~product_interactions,
  ~staff_interactions, ~staff_demos,
  
  "MBS", 0, "iPhone", 98, 16, 9,
  "MBS", 1, "Desktop", 18, 11, 5,
  "MBS", 2, "Accessories", 23, 5, 1,
  "MBS", 3, "iPhone", 124, 27, 14,
  "MBS", 4, "Desktop", 31, 16, 9,
  "MBS", 5, "Accessories", 29, 9, 3,
  
  "Orchard", 0, "iPhone", 66, 43, 23,
  "Orchard", 1, "Desktop", 73, 43, 24,
  "Orchard", 2, "Accessories", 24, 8, 6,
  "Orchard", 3, "iPhone", 69, 38, 20,
  "Orchard", 4, "Desktop", 80, 49, 29,
  "Orchard", 5, "Accessories", 31, 12, 8
)

employees <- tribble(
  ~store, ~zone, ~employee_count,
  
  "MBS", "iPhone", 9,
  "MBS", "Desktop", 5,
  "MBS", "Accessories", 4,
  
  "Orchard", "iPhone", 18,
  "Orchard", "Desktop", 13,
  "Orchard", "Accessories", 2
)