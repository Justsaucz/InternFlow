"""Run five independent real Robot suites and combine their genuine outputs."""
import argparse
import os
from pathlib import Path
import subprocess
import sys

SUITES = [
    ('01_authentication', 'Authentication'),
    ('02_job_discovery_application', 'Job Discovery and Application'),
    ('03_pipeline_placement', 'Application Pipeline and Placement'),
    ('04_daily_logbook', 'CWIE Daily Logbook'),
    ('05_mentor_evaluation', 'Mentor Review and Evaluation'),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--outputdir', required=True)
    args = parser.parse_args()
    output = Path(args.outputdir).resolve()
    source = Path(__file__).resolve().parent
    output.mkdir(parents=True, exist_ok=True)
    files = []
    failed = False
    for stem, name in SUITES:
        directory = output / stem
        command = [sys.executable, '-m', 'robot', '--name', name,
                   '--reporttitle', {'01_authentication':'Authentication','02_job_discovery_application':'Job Application','03_pipeline_placement':'Placement','04_daily_logbook':'Daily Logbook','05_mentor_evaluation':'Mentor Evaluation'}[stem] + ' - Test Results', '--outputdir', str(directory), str(source / (stem + '.robot'))]
        result = subprocess.run(command, check=False, env={**os.environ, 'STORAGE_MODE': 'local'})
        failed = failed or result.returncode != 0
        xml = directory / 'output.xml'
        if xml.is_file():
            files.append(str(xml))
    if len(files) == len(SUITES):
        result = subprocess.run([sys.executable, '-m', 'robot.rebot', '--name', 'InternFlow Project',
                                 '--reporttitle', 'InternFlow - Robot Test Results',
                                 '--output', 'output.xml', '--outputdir', str(output / 'all'), *files], check=False)
        failed = failed or result.returncode != 0
    else:
        failed = True
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
