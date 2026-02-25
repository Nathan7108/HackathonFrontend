import type { NextConfig } from "next";
import path from "path";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify("/cesium"),
        })
      );

      try {
        const cesiumPath = path.dirname(require.resolve("cesium/package.json"));
        const cesiumBuild = path.join(cesiumPath, "Build", "Cesium");

        config.plugins.push(
          new CopyPlugin({
            patterns: [
              {
                from: path.join(cesiumBuild, "Workers"),
                to: path.join(__dirname, "public", "cesium", "Workers"),
              },
              {
                from: path.join(cesiumBuild, "ThirdParty"),
                to: path.join(__dirname, "public", "cesium", "ThirdParty"),
              },
              {
                from: path.join(cesiumBuild, "Assets"),
                to: path.join(__dirname, "public", "cesium", "Assets"),
              },
              {
                from: path.join(cesiumBuild, "Widgets"),
                to: path.join(__dirname, "public", "cesium", "Widgets"),
              },
            ],
          })
        );
      } catch {
        // If CopyPlugin paths fail: manually copy node_modules/cesium/Build/Cesium/{Workers,ThirdParty,Assets,Widgets} to public/cesium/
      }
    }
    return config;
  },
};

export default nextConfig;
