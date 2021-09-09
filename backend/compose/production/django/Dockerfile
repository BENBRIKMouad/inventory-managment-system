ARG PYTHON_VERSION=3.9-slim-buster



# define an alias for the specfic python version used in this file.
FROM python:latest as python

# Python 'run' stage
FROM python as python-run-stage

ARG BUILD_ENVIRONMENT=production
ARG APP_HOME=/app
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV BUILD_ENV ${BUILD_ENVIRONMENT}

WORKDIR ${APP_HOME}
RUN mkdir $APP_HOME/staticfiles
RUN mkdir $APP_HOME/mediafiles

RUN addgroup --system django \
    && adduser --system --ingroup django django

COPY ./requirements.txt .
RUN pip install --upgrade pip --trusted-host pypi.org --trusted-host files.pythonhosted.org
RUN pip install -r requirements.txt


COPY --chown=django:django ./compose/production/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

RUN chown -R django:django $APP_HOME/staticfiles
RUN chmod +rw $APP_HOME/staticfiles
COPY --chown=django:django ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start


# copy application code to WORKDIR
COPY --chown=django:django . ${APP_HOME}

# make django owner of the WORKDIR directory as well.
RUN chown django:django ${APP_HOME}

USER django

ENTRYPOINT ["/entrypoint"]
