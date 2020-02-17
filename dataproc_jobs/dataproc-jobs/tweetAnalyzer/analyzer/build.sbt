import Dependencies._

ThisBuild / scalaVersion     := "2.11.8"
ThisBuild / version          := "0.1.0-SNAPSHOT"
ThisBuild / organization     := "com.twingua"

val sparkVersion = "2.3.2"
val hbaseVersion = "1.3.2"

lazy val root = (project in file(".")).
  settings(
    name := "analyzer",
    libraryDependencies += scalaTest % Test,
    libraryDependencies += "com.github.davidmoten" % "geo" % "0.7.1" % "provided",
    libraryDependencies += "org.apache.spark" % "spark-core_2.11" % sparkVersion % "provided",
    libraryDependencies += "org.apache.spark" % "spark-sql_2.11" % sparkVersion % "provided",
    libraryDependencies += "org.apache.spark" % "spark-streaming_2.11" % sparkVersion % "provided",

    resolvers += "Hortonworks Repository" at "http://repo.hortonworks.com/content/repositories/releases/",
    libraryDependencies += "com.hortonworks" % "shc-core" % "1.1.1-2.1-s_2.11",
    
    // resolvers += "Maven Repository" at "https://dl.bintray.com/spark-packages/maven/RedisLabs/spark-redis/",
    // libraryDependencies += "RedisLabs" % "spark-redis" % "0.3.2" exclude("com.redislabs", "jedis"),
    // libraryDependencies += "redis.clients" % "jedis" % "2.7.2"
    
    libraryDependencies += "com.redislabs" % "spark-redis" % "2.3.1" exclude("com.redislabs", "jedis"),
    libraryDependencies += "redis.clients" % "jedis" % "3.0.0-20181113.105826-9" from "https://oss.sonatype.org/content/repositories/snapshots/com/redislabs/jedis/3.0.0-SNAPSHOT/jedis-3.0.0-20181113.105826-9.jar"

    // libraryDependencies += "com.redislabs" % "spark-redis" % "2.3.0",
    // libraryDependencies += "redis.clients" % "jedis" % "2.9.0",
    // libraryDependencies += "org.apache.commons" % "commons-pool2" % "2.0"
  ).
  enablePlugins(AssemblyPlugin)

artifactName := { (sv: ScalaVersion, module: ModuleID, artifact: Artifact) => "analyzer.jar" }
// set the main class for 'sbt run'
mainClass in (Compile, run) := Some("com.twingua.analyzer.AnalyzerDriver")
// See https://www.scala-sbt.org/1.x/docs/Using-Sonatype.html for instructions on how to publish to Sonatype.
