use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Seat {
    id: String,
    row: u32,
    number: u32,
    seat_type: Option<String>,
}

#[derive(Serialize)]
struct SeatPosition {
    id: String,
    x: f32,
    y: f32,
    z: f32,
    row: u32,
    number: u32,
    seat_type: String,
    width_factor: f32,
}

// константи геометрії
const BASE_RADIUS: f32 = 8.0;   // радіус першого ряду
const ROW_STEP: f32 = 1.8;      // відстань між рядами
const SEAT_SPACING: f32 = 1.4;  // відстань між місцями

#[wasm_bindgen]
pub fn compute_positions(seats_json: &str) -> String {
    let seats: Vec<Seat> = serde_json::from_str(seats_json).unwrap_or_default();

    if seats.is_empty() {
        return "[]".to_string();
    }

    // знайти мінімальний ряд
    let min_row = seats.iter().map(|s| s.row).min().unwrap_or(1);

    // згрупувати по рядах для підрахунку кількості місць
    let mut row_counts: std::collections::HashMap<u32, u32> = std::collections::HashMap::new();
    for seat in &seats {
        *row_counts.entry(seat.row).or_insert(0) += 1;
    }

    let positions: Vec<SeatPosition> = seats.iter().map(|seat| {
        let radius = BASE_RADIUS + (seat.row - min_row) as f32 * ROW_STEP;
        let n = *row_counts.get(&seat.row).unwrap_or(&1) as f32;

        let seat_type = seat.seat_type.clone().unwrap_or_else(|| "standard".to_string());
        let width_factor: f32 = match seat_type.as_str() {
            "sofa2" => 2.0,
            "sofa3" => 3.0,
            _       => 1.0,
        };

        // кут між місцями враховує ширину крісла
        let angle_step = (SEAT_SPACING * width_factor) / radius;
        let total_angle = angle_step * (n - 1.0);
        let start_angle = -total_angle / 2.0;
        let angle = start_angle + (seat.number - 1) as f32 * angle_step;

        // 3D позиція — зал нахилений до глядача
        let x = radius * angle.sin();
        let z = radius * angle.cos() - BASE_RADIUS; // z — глибина
        let y = (seat.row - min_row) as f32 * 0.15; // легкий підйом рядів вгору

        SeatPosition {
            id: seat.id.clone(),
            x,
            y,
            z,
            row: seat.row,
            number: seat.number,
            seat_type,
            width_factor,
        }
    }).collect();

    serde_json::to_string(&positions).unwrap_or_default()
}
