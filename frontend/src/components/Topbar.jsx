function Topbar() {
    return (
        <nav className='bg-gray-950 border-b border-gray-800 px-8 py-4 flex items-center relative'>
            <a href='/' className='text-white text-xl font-bold'>
                Steam Stats
            </a>

            <div className='absolute left-1/2 -translate-x-1/2 flex items-center gap-4'>
                <input
                    type='text'
                    placeholder='Search games...'
                    className='bg-gray-800 text-white px-4 py-2 rounded outline-none border border-gray-700 focus:border-gray-500 w-64'
                />
                <a href='/tags' className='text-white text-lg hover:text-blue-400'>
                    Tags
                </a>
            </div>
        </nav>
    )
}

export default Topbar