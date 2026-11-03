import { useState } from 'react'

const FIELDS = [
    ['date_from', 'From date', 'date'],
    ['date_to', 'To date', 'date'],
    ['min_rating', 'Min rating %', 'number'],
    ['min_price', 'Min price', 'number'],
    ['max_price', 'Max price', 'number'],
    ['min_reviews', 'Min reviews', 'number'],
    ['max_reviews', 'Max reviews', 'number'],
]

function Filters({ onApply }) {
    const [draft, setDraft] = useState({})

    function apply(e) {
        e.preventDefault()
        onApply(Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== '')))
    }

    function clear() {
        setDraft({})
        onApply({})
    }

    return (
        <form onSubmit={apply} className='flex flex-wrap items-end gap-3 mb-5'>
            {FIELDS.map(([key, label, type]) => (
                <label key={key} className='flex flex-col gap-1 text-[10px] text-term-muted uppercase tracking-wide'>
                    {label}
                    <input
                        type={type}
                        min={type === 'number' ? 0 : undefined}
                        max={key === 'min_rating' ? 100 : undefined}
                        value={draft[key] ?? ''}
                        onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                        className='w-32 bg-term-bg border border-term-border rounded px-2 py-1 text-xs text-term-text normal-case outline-none focus:border-[#00d4aa44] [color-scheme:dark]'
                    />
                </label>
            ))}
            <button type='submit' className='text-xs px-3.5 py-1.5 rounded border border-[#00d4aa44] text-term-accent bg-[#00d4aa11] hover:bg-[#00d4aa22]'>
                apply
            </button>
            <button type='button' onClick={clear} className='text-xs px-3.5 py-1.5 rounded border border-term-border text-term-muted hover:text-term-accent'>
                clear
            </button>
        </form>
    )
}

export default Filters