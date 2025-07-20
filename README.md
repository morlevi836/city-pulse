# City Pulse

A real-time city data dashboard displaying public transport and municipal information using SIRI API.

## Features

- Real-time tracking of public transport vehicles
- Interactive maps with vehicle locations
- Display of municipality data (GeoJSON)
- User-friendly interface built with React and Express backend
- Data fetching and parsing from SIRI real-time API

## Technologies Used

- React (frontend)
- Node.js + Express (backend API)
- TypeScript
- Axios for HTTP requests
- Leaflet for interactive maps
- Moment.js for date formatting

## Project Structure

This project has two main parts:

- **client/** — React frontend
- **server/** — Express backend API

Each part is independent and requires separate installation and running.

## Installation and Running

### 1. Clone the repository

```bash
git clone https://github.com/morlevi836/city-pulse.git
cd city-pulse
```

### 2. Setup and run the backend

```bash
cd server
npm install
# or yarn install

npm run dev
# or yarn dev
```

The backend server will start (default port 3000 or configured port).

---

### 3. Setup and run the frontend

Open a new terminal window/tab:

```bash
cd client
npm install
# or yarn install

npm start
# or yarn start
```

The React app will start (default port 5173).

---

## Environment Variables

### Backend (`server/.env`)

Create a `.env` file inside the `server` folder with:

```
SIRI_BASE_URL=https://eliabs-siri-ex.s3.amazonaws.com/siri-data/
MUNICIPALITIES_URL=https://eliabs-siri-ex.s3.eu-west-3.amazonaws.com/municipalities_multi.geojson
PORT=5000

---

## Usage

- Open the frontend in the browser: [http://localhost:5173](http://localhost:5173)
- The frontend communicates with the backend API running on port 3000 (or your configured port)
- Backend serves data like `/api/municipalities` and other SIRI-related endpoints

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
