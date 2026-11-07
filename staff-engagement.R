engagement <- observations %>%
  group_by(store, zone) %>%
  summarise(
    product_total = sum(product_interactions),
    staff_total = sum(staff_interactions),
    demo_total = sum(staff_demos),
    
    staff_engagement =
      staff_total / product_total * 100,
    
    demo_ratio =
      demo_total / staff_total * 100,
    
    .groups = "drop"
  )

print(engagement)