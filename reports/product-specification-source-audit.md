# Product Specification Source Audit

- Product rows: 26
- Discovered product/showroom pages: 42
- Successfully read catalog pages: 46
- Failed catalog pages: 9
- Duplicate main/mobile evidence pages: 0
- Exact matches: 10
- Strong matches: 8
- Partial matches: 7
- No match: 1
- Accepted field values: 130
- Conflicted fields: 65
- Fields remaining TBD: 682
- Company-level values rejected: 4
- Products requiring manual review: 26

| SKU | Product | Category | Match | Confidence | Accepted fields | Conflict fields | Status | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GS-WRA-001 | Custom Wire Rope Cable Assembly | wire-rope-assemblies | strong | medium | construction;material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;coating_material;coating_color;moq;production_lead_time;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-WRA-002 | Stainless Steel Wire Rope Assembly | wire-rope-assemblies | partial | low | None | construction;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;coating_material;coating_color;moq;production_lead_time;customization_options;material | unverified | Confirm product identity before accepting any candidate value. |
| GS-WRA-003 | Galvanized Wire Rope Assembly | wire-rope-assemblies | partial | low | None | construction;material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;coating_material;coating_color;moq;production_lead_time;customization_options | unverified | Confirm product identity before accepting any candidate value. |
| GS-WRA-004 | PVC Coated Wire Rope Assembly | wire-rope-assemblies | partial | low | None | material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;production_lead_time;packaging;customization_options;coating_material | unverified | Confirm product identity before accepting any candidate value. |
| GS-WRA-005 | Wire Rope Assembly with Eye Loops | wire-rope-assemblies | partial | low | None | construction;material;material_grade;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;coating_material;coating_color;finished_diameter_min_mm;finished_diameter_max_mm;end_a_type;end_a_dimensions;end_b_type;end_b_dimensions | unverified | Confirm product identity before accepting any candidate value. |
| GS-WRA-006 | Wire Rope Assembly with Carabiner Hook | wire-rope-assemblies | partial | low | None | end_a_type | unverified | Confirm product identity before accepting any candidate value. |
| GS-LAN-001 | Coiled Tool Safety Lanyard | tool-safety-lanyards | strong | high | material;coating_material;coating_color;finished_diameter_min_mm;finished_diameter_max_mm;end_a_type;end_b_type;moq;customization_options | length_max_mm;retracted_length_mm;breaking_load | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-LAN-002 | Tool Lanyard with Carabiner | tool-safety-lanyards | exact | high | material;coating_material;coating_color;moq;customization_options | length_max_mm | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-LAN-003 | Tool Lanyard with Dual Hooks | tool-safety-lanyards | exact | high | construction;material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;coating_material;length_min_mm;length_max_mm;end_a_type;end_b_type;moq;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-LAN-004 | Spring Coil Safety Lanyard | tool-safety-lanyards | strong | medium | material;coating_material;coating_color;finished_diameter_min_mm;finished_diameter_max_mm;end_a_type;end_b_type;moq;customization_options | length_max_mm;retracted_length_mm | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-SUS-001 | Lighting Suspension Cable Kit | suspension-hanging-kits | strong | high | material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;length_min_mm;length_max_mm;gripper_type;moq;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-SUS-002 | Adjustable Cable Gripper Kit | suspension-hanging-kits | exact | high | material;coating_color;gripper_type;moq;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-SUS-003 | LED Panel Suspension Kit | suspension-hanging-kits | exact | high | material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;length_min_mm;length_max_mm;upper_fitting;lower_fitting;gripper_type;moq;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-SUS-004 | Sign Hanging Cable Kit | suspension-hanging-kits | strong | medium | construction;material;material_grade;length_min_mm;length_max_mm;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-CTL-001 | Bowden Cable Assembly | control-brake-cables | exact | high | material;inner_cable;moq;customization_options | wire_rope_diameter_min_mm;construction;length_min_mm;length_max_mm;outer_casing | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-CTL-002 | Push Pull Control Cable | control-brake-cables | exact | high | material;inner_cable;moq;customization_options | wire_rope_diameter_min_mm;construction;length_min_mm;length_max_mm;outer_casing | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-CTL-003 | Brake Cable Assembly | control-brake-cables | partial | low | None | wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;outer_casing;customization_options;coating_material | unverified | Confirm product identity before accepting any candidate value. |
| GS-CTL-004 | Throttle Control Cable | control-brake-cables | strong | high | material;inner_cable;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-GYM-001 | Gym Equipment Cable Assembly | gym-fitness-cables | exact | high | material;material_grade;coating_color;moq;production_lead_time;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-GYM-002 | Weight Stack Cable Assembly | gym-fitness-cables | exact | high | material;material_grade;coating_color;end_a_type;end_b_type;end_b_thread;end_b_dimensions;moq;production_lead_time;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-GYM-003 | PVC Coated Gym Cable | gym-fitness-cables | strong | medium | construction;material;wire_rope_diameter_min_mm;wire_rope_diameter_max_mm;length_min_mm;length_max_mm;moq;sample_lead_time;production_lead_time;packaging;customization_options | coating_material | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-GYM-004 | Fitness Cable with Ball End | gym-fitness-cables | strong | high | material;material_grade;coating_color;end_b_type;end_b_dimensions;moq;production_lead_time;customization_options | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |
| GS-FIT-001 | Wire Rope Thimble | wire-rope-fittings | exact | high | applicable_standard;moq;packaging;compatible_wire_rope_diameter_min_mm;compatible_wire_rope_diameter_max_mm;customization_options | material;surface_finish;production_lead_time | incomplete | Resolve conflicts and confirm the selected configuration before review. |
| GS-FIT-002 | Wire Rope Sleeve | wire-rope-fittings | partial | low | None | None | unverified | Confirm product identity before accepting any candidate value. |
| GS-FIT-003 | Swage Terminal | wire-rope-fittings | none | low | None | end_a_type | unverified | Find a direct product detail page or obtain a Gaoshuo drawing/datasheet. |
| GS-FIT-004 | Cable Gripper | wire-rope-fittings | exact | high | material;surface_finish;production_lead_time;customization_options;compatible_wire_rope_diameter_min_mm;compatible_wire_rope_diameter_max_mm | None | incomplete | Verify extracted options against the intended Gaoshuo configuration before review. |

## Company-level values rejected

- wire_rope_diameter_min_mm: 0.5-12 mm — Company capability; not applied to any SKU.
- material_grade: 304/316 stainless steel — Company capability; not applied to any SKU.
- construction: 1x19, 7x7, 7x19 — Company capability; not applied to any SKU.
- applicable_standard: ISO 9001 and IATF 16949 — Enterprise certification is not a product standard and is rejected.
