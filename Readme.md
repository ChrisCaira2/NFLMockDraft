# NFL Mock Draft Tool

This project is an NFL Mock Draft Tool that allows users to simulate an NFL draft. Users can select teams, set the number of rounds, and draft players based on team needs and player rankings.

## Features

- Select teams to control during the draft
- Set the number of rounds for the draft
- Auto-draft functionality with the ability to pause and resume
- Filter available players by position
- View drafted players and their details

## Screenshots

![Select Teams][/Users/chriscaira/NFLMockDraft/public/screenshots/teams.png]
![Draft Players][public/screenshots/draft.png]
![Mock Draft][public/screenshots/mock.png]

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ChrisCaira2/NFLMockDraft.git
   cd NFLMockDraft
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

### Project Structure

- `components/`: Contains React components used in the application
- `pages/`: Contains Next.js pages
- `public/data/`: Contains JSON data files for teams, players, and draft order

### Available Scripts

- `npm run dev` or `yarn dev`: Start the development server
- `npm run build` or `yarn build`: Build the application for production
- `npm start` or `yarn start`: Start the production server


### License

This project is licensed under the MIT License.
