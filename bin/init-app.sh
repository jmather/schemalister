#!/usr/bin/env bash
/env/bin/pip install -r requirements.txt
/env/bin/python /app/manage.py syncdb --noinput
. /env/bin/activate
/env/bin/honcho start