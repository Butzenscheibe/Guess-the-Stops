"""Render-only policy checks: no application build, secrets, or runtime writes."""
import json
import os
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ComposeLoggingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        env = {k: v for k, v in os.environ.items()
               if not k.startswith(("COMPOSE_", "DB_PATH_")) and k != "PORT"}
        result = subprocess.run(
            ["docker", "compose", "--env-file", "/dev/null", "-f",
             str(ROOT / "docker-compose.yml"), "config", "--format", "json"],
            check=True, capture_output=True, text=True, env=env, timeout=30,
        )
        cls.config = json.loads(result.stdout)
        cls.service = cls.config["services"]["guess-the-stops"]

    def test_bounded_logging(self):
        self.assertEqual(self.service["logging"], {
            "driver": "json-file", "options": {"max-size": "10m", "max-file": "5"},
        })

    def test_service_scope(self):
        self.assertEqual(set(self.config["services"]), {"guess-the-stops"})
        self.assertEqual(self.service["container_name"], "guess-the-stops")
        self.assertEqual(self.service["restart"], "unless-stopped")
        self.assertEqual(self.service["build"]["context"], str(ROOT))
        self.assertEqual(set(self.service["networks"]), {"guess-the-stops-network"})

    def test_existing_database_bind_and_port(self):
        self.assertEqual(len(self.service["volumes"]), 1)
        volume = self.service["volumes"][0]
        self.assertEqual(volume["type"], "bind")
        self.assertEqual(volume["source"], str(ROOT / "database"))
        self.assertEqual(volume["target"], "/app/database")
        self.assertFalse(volume.get("read_only", False))
        ports = self.service["ports"]
        self.assertEqual(len(ports), 1)
        self.assertEqual((ports[0]["target"], str(ports[0]["published"])), (3000, "3000"))


if __name__ == "__main__":
    unittest.main()
