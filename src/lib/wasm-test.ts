export async function testWasm() {
  const { default: init, compute_positions } = await import('../../public/wasm/seat-engine/seat_engine.js')
  await init()
  
  const testSeats = [
    { id: "1", row: 1, number: 1 },
    { id: "2", row: 1, number: 2 },
    { id: "3", row: 2, number: 1 },
  ]
  
  const result = compute_positions(JSON.stringify(testSeats))
  console.log('WASM result:', JSON.parse(result))
}
