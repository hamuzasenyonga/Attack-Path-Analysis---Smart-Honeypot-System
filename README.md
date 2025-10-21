# DDoS Attack Analysis Dashboard

A real-time honeypot monitoring and threat intelligence dashboard built with Next.js. This application provides comprehensive visualization and analysis of DDoS attack data with an intuitive dark-themed interface.

## Features

### 📊 Real-time Monitoring
- **Live Attack Feed**: Real-time threat monitoring with detailed attack information
- **Attack Timeline**: 24-hour temporal distribution of attacks by severity level
- **Key Metrics**: Total attacks, blocked attacks, active threats, and critical level indicators

### 📈 Data Visualization
- **Attack Types Chart**: Distribution by attack vector (UDP, SYN, HTTP, DNS)
- **Protocol Distribution**: Pie chart showing attacks by network protocol
- **Source Countries**: Horizontal bar chart of top attack source locations
- **Historical Data Table**: Detailed attack logs with filtering capabilities

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark interface optimized for monitoring environments
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Sticky Navigation**: Header remains accessible while scrolling
- **Interactive Elements**: Hover effects, transitions, and real-time updates

### 🔍 Advanced Filtering
- **Severity Filter**: Filter attacks by Critical, High, Medium, or Low severity
- **Type Filter**: Filter by attack type (SYN Flood, HTTP Flood, UDP Flood, DNS Amplification)
- **Real-time Updates**: Live data refresh and monitoring

## Technology Stack

- **Framework**: Next.js 15.5.6 with App Router
- **Styling**: Tailwind CSS 3.4.0
- **Charts**: Recharts for data visualization
- **Icons**: Heroicons for consistent iconography
- **Date Handling**: date-fns for timestamp formatting
- **Language**: JavaScript (ES6+)

## Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dos
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Tailwind configuration
│   ├── layout.js            # Root layout component
│   └── page.js              # Main dashboard page
├── components/              # Reusable components (future expansion)
└── data/                    # Mock data and utilities (future expansion)
```

## Key Components

### Dashboard Sections
1. **Header**: Title, subtitle, and action buttons (Generate Data, Export CSV)
2. **Metrics Cards**: Key performance indicators with color-coded severity
3. **Attack Timeline**: Line chart showing 24-hour attack distribution
4. **Live Attack Feed**: Real-time attack monitoring panel
5. **Analysis Charts**: Attack types, protocol distribution, and source countries
6. **Historical Data Table**: Detailed logs with filtering and sorting

### Data Visualization
- **Line Charts**: Attack timeline with multiple severity levels
- **Bar Charts**: Attack types and source countries
- **Pie Charts**: Protocol distribution
- **Data Tables**: Historical attack logs with interactive filtering

## Customization

### Adding New Attack Types
Modify the `attackTypesData` array in `page.js` to include new attack vectors.

### Updating Color Schemes
Modify the color functions (`getSeverityColor`, `getProtocolColor`, `getStatusColor`) to change the color coding.

### Adding New Metrics
Extend the metrics cards section to include additional KPIs relevant to your monitoring needs.

## Deployment

### Vercel (Recommended)
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Other Platforms
This Next.js application can be deployed to any platform that supports Node.js applications.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons by [Heroicons](https://heroicons.com/)

---

**Made with Emergent** - Real-time threat intelligence and monitoring solutions.