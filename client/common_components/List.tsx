import React from 'react'

interface ListProps<T> {
    items: T[],
    renderItem: (item: T) => React.ReactNode
}

const List = <T extends {}>({ items, renderItem }: ListProps<T>) => {
    return (
        <ul>
            {items.map((item, i) => (
                <li key={i}>{renderItem(item)}</li>
            ))}
        </ul>
    )
}

export default List