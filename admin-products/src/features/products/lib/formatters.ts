export function formatPriceRUB(value: number) {
    const fixed = value.toFixed(2).replace('.', ',')
    const [intPart, frac] = fixed.split(',')
    const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    return `${spaced},${frac}`
}
