function Pagination({ page, total, limit, onPageChange }) {
    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) return null

    function getPageNumbers() {
        const pages = new Set()
        pages.add(1)
        pages.add(totalPages)
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
            pages.add(i)
        }

        const sorted = [...pages].sort((a, b) => a - b)
        const result = []
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
                result.push(null) // gap
            }
            result.push(sorted[i])
        }
        return result
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className='flex gap-1.5 items-center mt-5 text-xs'>
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className='px-3 py-1.5 rounded border border-term-border bg-term-panel text-term-muted hover:text-term-accent hover:border-[#00d4aa44] disabled:opacity-40 disabled:hover:text-term-muted disabled:hover:border-term-border transition-colors'
            >
                prev
            </button>

            {pageNumbers.map((num, i) =>
                num === null ? (
                    <span key={`gap-${i}`} className='px-1 text-term-dim'>...</span>
                ) : (
                    <button
                        key={num}
                        onClick={() => onPageChange(num)}
                        className={
                            num === page
                                ? 'px-3 py-1.5 rounded border border-[#00d4aa44] text-term-accent bg-term-panel'
                                : 'px-3 py-1.5 rounded border border-term-border bg-term-panel text-term-muted hover:text-term-accent hover:border-[#00d4aa44] transition-colors'
                        }
                    >
                        {num}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className='px-3 py-1.5 rounded border border-term-border bg-term-panel text-term-muted hover:text-term-accent hover:border-[#00d4aa44] disabled:opacity-40 disabled:hover:text-term-muted disabled:hover:border-term-border transition-colors'
            >
                next
            </button>
        </div>
    )
}

export default Pagination