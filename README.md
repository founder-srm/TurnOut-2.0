# TurnOut

TurnOut is a modern and advanced attendance marking system built with **React Native** and **NativeWind**, powered by **Supabase** as the backend. The app provides an intuitive and seamless user experience for managing attendance efficiently.

## Features

- 🚀 **Modern UI** – Built with NativeWind for a sleek and responsive design.
- ✅ **Easy Attendance Tracking** – Mark attendance with a tap.
- 🔐 **Secure Authentication** – Uses Supabase for authentication and user management.
- 📊 **Real-Time Data** – Syncs attendance records in real-time with Supabase.
- 🌐 **Cross-Platform** – Works on both Android and iOS devices.

## Tech Stack

- **Frontend**: React Native, NativeWind (Tailwind for React Native)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Realtime)
- **State Management**: React Context API / Zustand (if used)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/VijayMakkad/TurnOut-2.0.git
   cd turnOut
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Setup Supabase:
   - Create a project on [Supabase](https://supabase.com/).
   - Get the API keys and database URL from the Supabase dashboard.
   - Create a `.env` file in the root directory and add:
     ```env
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
   ```sh
   pnpm start
   ```

## Usage

- Open the app and sign in using your credentials.
- Mark attendance easily with a tap.
- View real-time updates on attendance records.
- Manage users and permissions (Admin role required).


## Contributing

Contributions are welcome! Feel free to open issues and pull requests to enhance the project.

## License

This project is licensed under the **MIT License**.

## Contact

For queries and suggestions, reach out to [Vijay Makkad](mailto:vijaymakkad0104@gmail.com).

