import './CategoryFilter.css'

const DEFAULT_CATEGORIES = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧' },
  { value: 'road_damage', label: 'Road Damage', icon: '🚧' },
  { value: 'other', label: 'Other', icon: '⚠️' },
]

export default function CategoryFilter({ selected = 'all', onChange, categories }) {
  const items = categories || DEFAULT_CATEGORIES

  return (
    <div className="category-filter" id="category-filter">
      <div className="category-filter__scroll">
        {items.map((cat) => (
          <button
            key={cat.value}
            className={`category-filter__pill ${selected === cat.value ? 'category-filter__pill--active' : ''}`}
            onClick={() => onChange(cat.value)}
            id={`category-pill-${cat.value}`}
          >
            <span className="category-filter__icon">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
