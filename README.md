# KOKO Student App Portal (StudentAppPortal)
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/jay-lchicken/studentappportal)


A Next.js project for managing student-related tasks and information.

## Key Features & Benefits

- **User Authentication:** Secure user authentication using Auth0.
- **Class Management:** Functionality to create, manage, and rename classes.
- **Role-Based Access Control:** Different roles (e.g., admin) with varying permissions.
- **Drag and Drop Interface:** Uses `dnd-kit` for interactive drag and drop functionality (implementation details not provided).

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

- **Node.js:** (Version >= 18 is recommended)
- **npm, yarn, pnpm, or bun:** Package managers for JavaScript projects.
- **PostgreSQL:** A relational database for storing application data.

The project utilizes the following key dependencies:

- **Next.js:** A React framework for building web applications.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **Auth0:** For authentication and authorization.
- **@dnd-kit:** For drag-and-drop functionality.
- **@radix-ui/react-\*:** UI components from Radix UI.
- **PostgreSQL:** A relational database.

## Installation & Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   cd studentappportal
   ```

2. **Install dependencies:**

   Choose one of the following package managers and run the appropriate command:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Configure Environment Variables:**

   Create a `.env.local` file in the root directory and configure the necessary environment variables.  These will include Auth0 credentials, database connection details, etc.  Consult the Auth0 and PostgreSQL documentation for specific requirements.

   Example (incomplete):

   ```
   AUTH0_DOMAIN=<your_auth0_domain>
   AUTH0_CLIENT_ID=<your_auth0_client_id>
   AUTH0_CLIENT_SECRET=<your_auth0_client_secret>
   AUTH0_CALLBACK_URL=<your_callback_url>

   POSTGRES_USER=<your_postgres_user>
   POSTGRES_PASSWORD=<your_postgres_password>
   POSTGRES_DB=<your_postgres_db>
   POSTGRES_HOST=<your_postgres_host>
   POSTGRES_PORT=<your_postgres_port>
   ```

4. **Database Setup:**

   - Create a PostgreSQL database using the credentials specified in your `.env.local` file.
   - Run any necessary database migrations or schema creation scripts (details of these scripts are not provided in the technical details).

5. **Run the Development Server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage Examples & API Documentation

### API Endpoints (Example)

- **`POST /api/changeclassname`:**  Renames a class. Requires authentication.
    - **Request Body:**
      ```json
      {
        "class_name": "New Class Name",
        "class_id": "class_id_to_update"
      }
      ```
    - **Authentication:** Uses Auth0 session to verify user identity.
    - **Authorization:**  Checks if the user has permission to modify the class.
- **`PATCH /api/class-member/role`:** Updates the role of a member in a class (e.g., promotes to admin). Requires authentication.
    - **Request Body:**
      ```json
      {
        "hash_userid": "hashed_user_id",
        "class_id": "class_id",
        "isadmin": true
      }
      ```
    - **Authentication:** Uses Auth0 session to verify user identity.
    - **Authorization:**  Checks if the user has permission to modify roles in the class.

*Note:* More detailed API documentation, including request and response schemas, should be added here as the project evolves.

## Configuration Options

The application is configured primarily through environment variables.  Refer to the installation steps for setting up the `.env.local` file. Specific configurable settings beyond authentication and database are not explicitly detailed in provided information.

## Contributing Guidelines

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes.
4.  Write tests to ensure your changes are working correctly.
5.  Submit a pull request with a clear description of your changes.

## License Information

License information is not specified. Please specify the license (e.g., MIT, Apache 2.0, GPL) in this section. For example:

```
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
```

## Acknowledgments

- This project uses [Next.js](https://nextjs.org/).
- Authentication is provided by [Auth0](https://auth0.com/).
- Drag and Drop functionality provided by [@dnd-kit](https://dndkit.com/)
- UI components provided by [@shadcn-ui](https://www.ui.shadcn.com/)
