# Submission Rules

## Contribution Workflow & Branch Naming

Each contributor must create a **separate branch** for each small feature module or bug fix.  
Please do not commit or push directly to the `main` branch.

After you finish your code on your own branch and push it to GitHub, I will run the necessary checks (for example, compilation) and review the changes.  
If there are no problems, I will merge your branch into the `main` branch.

### Branch Naming Convention

When you create your own branch, please follow this fixed format:

- `feature/<name>-<short-description>` – for new features  
- `fix/<name>-<short-description>` – for bug fixes  
- `refactor/<name>-<short-description>` – for refactor / cleanup / code structure changes  

Examples:

- `feature/Yanglin-money-split-ui`  
- `feature/lee-login-page`  
- `fix/Hong-invite-bug`  
- `refactor/peng-store-structure`  

This way, it is clear:

- who is responsible for the branch (your name is included)  
- what type of work it is (`feature`, `fix`, or `refactor`)  
- what the branch roughly does (the short English description at the end)

### Recommended Working Style

Everyone is encouraged to:

- implement **one small feature** or **fix one specific bug** in a single branch  
- push the branch to GitHub as soon as that small task is finished  
- then open a Pull Request (PR) from that branch into `main`

I will check the PR, and if there are no issues, I will merge it into the `main` branch.


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
