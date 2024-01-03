# G-HTric: 3W Dataset Generator with Annotated Examples and Triclustering Solutions ⚙️ ⛏️

## Introduction

Welcome to G-HTric, a cutting-edge solution designed to revolutionize the generation of synthetic three-way datasets with mixed-type triclustering solutions and annotated examples. G-HTric excels in managing heterogeneity, accommodating mixed attribute types with arbitrarily different distributions and patterns displaying diverse regularities. This advanced generator supports the labeling of observations, significantly enhancing its utility for evaluating the discriminative power of triclustering solutions.

## Getting Started 🛠️

### Prerequisites

Ensure that you have [Docker](https://www.docker.com) installed on your system before running G-HTric.

### Building and Running with Docker

1. Clone this repository to your local machine.

    ```bash
    git clone https://github.com/dfmsoares/ghtric.git
    cd repository
    ```

2. Build the Docker image.

    ```bash
    docker build -t <image-name> .
    ```

    Replace `<image-name>` with your desired name for the Docker image.

3. Run the Docker container.

    ```bash
    docker run -d -p 8080:8080 <image-name>
    ```

### Accessing the Application

Once the Docker container is running, access the application through your web browser:

- [http://localhost:8080](http://localhost:8080)
- [http://127.0.0.1:8080](http://127.0.0.1:8080)

## Note 🔎

Ensure that `<image-name>` is replaced with your chosen name for the Docker image.

Feel free to explore and leverage the capabilities of G-HTric for your three-way dataset generation with annotated examples and planted triclustering solutions. If you encounter any issues or have suggestions, please check the [issues](https://github.com/example/repository/issues) section of the repository. A [documentation file]() is also available with details of the tool.

Happy data processing with G-HTric! 🎉

## Citing the Paper 📑

If you use G-HTric in your research, please cite our paper:

*D.F. Soares, R. Henriques, and S.C. Madeira. (2024). G-HTric: Synthetic Generation of Heterogeneous Three-way Datasets with Annotated Triclustering Solutions. [Available Soon]*


