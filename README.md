# Word Document Data Extractor for Diekirch Military Museum

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/yourusername/yourrepository/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)

This project, the Word Document Data Extractor for the Diekirch Military Museum, plays a crucial role in the preservation and sharing of Luxembourg's military heritage. Its primary focus is on extracting valuable data from a vast collection of historical Word documents meticulously compiled by Mr. Victor Steichen over many years.

## Table of Contents
- [Word Document Data Extractor for Diekirch Military Museum](#word-document-data-extractor-for-diekirch-military-museum)
  - [Table of Contents](#table-of-contents)
  - [Project Objective](#project-objective)
  - [Comprehensive Initiative](#comprehensive-initiative)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Usage and Features](#usage-and-features)
    - [Usage Instructions and Document Requirements](#usage-instructions-and-document-requirements)
      - [Document Requirements](#document-requirements)
    - [Example](#example)
  - [Contributing](#contributing)
    - [Code Formatting](#code-formatting)
    - [Issue Reporting](#issue-reporting)
    - [Pull Requests](#pull-requests)
    - [Branch Naming Conventions:](#branch-naming-conventions)
    - [Commit Message Formats:](#commit-message-formats)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)
  - [Contact](#contact)

## Project Objective

The main objective of this extractor is to automate the process of converting the contents of these historical documents into structured data. By doing so, it facilitates essential tasks such as cataloging, searching, and utilizing the wealth of historical records. This digital archiving effort represents a significant step forward in promoting historical research and contributing to the museum's mission of preserving and sharing Luxembourg's military history.

## Comprehensive Initiative

While this project focuses on the data extraction aspect, it is part of a larger initiative that encompasses various stages of data organization and presentation. Collaboration within the project team ensures a comprehensive and cohesive approach to preserving the museum's invaluable collection and making it more accessible to researchers, historians, and the general public.

## Prerequisites

Before running the project, make sure you have Node.js and npm installed on your system.

## Installation

To set up the necessary dependencies for running the project, use the package manager npm to install them:

```bash
npm install
```

## Getting Started

There are two ways to run the project:

1. Run the `index.js` file using npm:

```bash
npm run start
```

2. Click the `start.bat` file:

   - Double-click the `start.bat` file to execute the guided sequence in the terminal.

## Usage and Features

The Word Document Data Extractor for the Diekirch Military Museum is designed to be user-friendly and straightforward. Its primary purpose is to automate the extraction of data from Word documents, making it easy for users to process and utilize historical records.

### Usage Instructions and Document Requirements

To use the Word Document Data Extractor for the Diekirch Military Museum effectively, please follow these instructions. Also, ensure that the input Word documents meet specific requirements for successful data extraction.

1. Install Dependencies: Before running the project, ensure you have Node.js and npm installed on your system. To install the required project dependencies, open a terminal or command prompt, navigate to the project's root directory, and run the following command:

```bash
npm install
```

2. Run the Script: To begin the data extraction process, execute the main script by running the following command:

```bash
npm run start
```

3. Add Input Files: After running the script, a folder named "Files" will be created in the project directory. Inside this folder, you will find an "inputs" subfolder. Add your Word documents to this "inputs" folder. These documents should contain historical data collected by Mr. Victor Steichen.

4. View Extracted Data: Once the script completes its execution, the extracted data will be stored in the "outputs" folder within the "Files" directory. The extracted data will be organized and saved in different formats, making it easily accessible and ready for further analysis.

#### Document Requirements

For successful data extraction, you must go into the Constants.js file and configure your set of:

- Expected Main Fields
- Expected Sub Fields
- Required Main Fields

The current project comes with a set of fields preconfigured, it is recommeded to check over the Constants.js file though to ensure that you get the expected behaviour. 

If you are not getting the expected behaviour, make sure to check the console for any red or yellow messages which may help you in troubleshooting the issue, if this still doesn't help, [Report it as an Issue](#issue-reporting)

### Example

Provide an example of how to use the project with a code snippet or

 a step-by-step guide.

## Contributing

We welcome contributions from the community to improve the Word Document Data Extractor for the Diekirch Military Museum. Whether it's fixing bugs, adding new features, improving documentation, or suggesting enhancements, your contributions can make a significant impact on the project. Here's how you can contribute:

### Code Formatting

To maintain consistency and readability in the codebase, we follow a specific code formatting style. Before submitting your code changes, please ensure that your code adheres to the formatting guidelines. You can use the following scripts to automatically format your code:

```bash
npm run lint
npm run format
```

However, keep in mind that some issues might not be fixed by these scripts. For thorough code analysis, we recommend using the ESLint extension for VSCode. The extension will help you identify any potential issues or violations of the coding standards.

### Issue Reporting

If you encounter any bugs, unexpected behavior, or have ideas for enhancements, please report them by creating an issue on our GitHub repository. When reporting an issue, please include the following information:

1. A clear and descriptive title for the issue.
2. Detailed steps to reproduce the problem (if applicable).
3. Information about your environment (Node.js version, npm version, operating system, etc.).
4. Any relevant error messages or logs.

This information will help us understand the problem better and work towards resolving it.

### Pull Requests

If you'd like to contribute code to the project, you can do so by creating a pull request (PR) on GitHub. Before submitting a PR, please follow these guidelines:

1. Fork the repository and create a new branch for your changes.
2. Ensure that your code adheres to the code formatting guidelines mentioned above.
3. Provide a clear and concise description of the changes in your PR.
4. If your PR addresses a specific issue, reference the issue number in the PR description using the format `Fixes #issue_number`.
5. Test your changes thoroughly to ensure they do not introduce new bugs or issues.
6. Be open to feedback and address any review comments promptly.

Once your PR is submitted, our team will review your changes and provide feedback. We may request additional changes or tests before merging your changes into the main project.

Contributing to open-source projects like this one is a rewarding experience, and we appreciate all efforts to make the Word Document Data Extractor even better! Thank you for considering contributing to our project!

### Branch Naming Conventions:

1. **Feature Branches**: When working on a new feature or enhancement, create a branch with a descriptive name that reflects the feature's purpose. Use kebab-case (lowercase words separated by hyphens) to format the branch name. For example: `feature/add-user-authentication`.

2. **Bug Fix Branches**: When addressing a bug or issue, create a branch with a name that clearly identifies the problem being fixed. Again, use kebab-case for the branch name. For example: `bugfix/fix-login-crash`.

3. **Hotfix Branches**: For urgent fixes that need to be applied to the production environment quickly, use a hotfix branch. Follow the same kebab-case convention, but prefix the branch name with `hotfix/`. For example: `hotfix/security-vulnerability`.

4. **Release Branches**: When preparing for a new release version, create a release branch with the version number. For example: `release/v1.2.0`.

### Commit Message Formats:

1. **Title**: Keep the commit title concise (around 50 characters) and descriptive. Use the imperative mood (e.g., "Add," "Fix," "Update") to indicate what the commit accomplishes.

2. **Body**: Provide a more detailed explanation in the commit body (if necessary). Describe the changes made and why they were necessary. Use bullet points or numbered lists for clarity.

3. **Issue References**: If the commit is related to an open issue or task in the project's issue tracker, include a reference to the issue number in the commit message. Use the format `Fixes #issue_number` or `Closes #issue_number`.

Here's an example of a well-formatted commit message:

```
Add user authentication feature

- Implement user sign-up and login functionality
- Hash and securely store user passwords
- Include error handling for authentication failures

Fixes #123
```

## License

```
Copyright 2023 Sebastian Mostert
All rights reserved.

This software is licensed under the MIT License.
See LICENSE file in the project root for full license information.
```

## Acknowledgements

I would like to acknowledge the following npm packages and libraries that made this project possible:

- [chalk](https://www.npmjs.com/package/chalk) - Version 4.1.2: For providing beautiful and customizable terminal text styling.
- [cheerio](https://www.npmjs.com/package/cheerio) - Version 1.0.0-rc.12: For enabling fast and flexible server-side HTML parsing and manipulation.
- [fs-extra](https://www.npmjs.com/package/fs-extra) - Version 11.1.1: For extending the functionality of the built-in `fs` module with additional methods.

- [mammoth](https://www.npmjs.com/package/mammoth) - Version 1.6.0: For converting Word documents (.docx) to HTML and extracting useful data from them.

These packages have significantly contributed to the development and functionality of this project. A big thank you to their creators and the broader open-source community!

## Contact

If you have any questions, need support, or want to discuss anything related to this project, please feel free to reach out to me. I'm more than happy to help!

You can contact me through the following channels:

- Email: sebastianmostert663@gmail.com
```
