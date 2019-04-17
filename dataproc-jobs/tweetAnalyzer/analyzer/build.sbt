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
    // libraryDependencies ++= Seq(
    //   "org.apache.hbase" % "hbase-server" % hbaseVersion % "provided",
    //   "org.apache.hbase" % "hbase-client" % hbaseVersion % "provided",
    //   "org.apache.hbase" % "hbase-common" % hbaseVersion % "provided",
    //   "org.apache.hadoop" % "hadoop-common" % "2.7.1" % "provided"
    // ),
    resolvers += "Hortonworks Repository" at "http://repo.hortonworks.com/content/repositories/releases/",
    libraryDependencies += "com.hortonworks" % "shc-core" % "1.1.1-2.1-s_2.11"
  ).
  enablePlugins(AssemblyPlugin)

artifactName := { (sv: ScalaVersion, module: ModuleID, artifact: Artifact) => "analyzer.jar" }

// set the main class for 'sbt run'
mainClass in (Compile, run) := Some("com.twingua.analyzer.Hello")
// See https://www.scala-sbt.org/1.x/docs/Using-Sonatype.html for instructions on how to publish to Sonatype.
