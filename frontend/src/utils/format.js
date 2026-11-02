export function scoreColor(desc) {
    if (!desc) return '#7a7a9a'
    if (desc.includes('Negative')) return '#ff5f57'
    if (desc.includes('Mixed')) return '#f59e0b'
    return '#28c840'
}