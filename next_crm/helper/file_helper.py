from django.conf import settings
from django.core.files.storage import FileSystemStorage
import os, errno, requests
from PIL import Image


def create_pdf_from_url(pdf_url, file_full_path):
    r = requests.get(pdf_url, stream=True)
    if not os.path.exists(os.path.dirname(file_full_path)):
        try:
            os.makedirs(os.path.dirname(file_full_path))
        except OSError as exc:  # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise
    with open(file_full_path, 'wb') as fd:
        for chunk in r.iter_content(2000):
            fd.write(chunk)
    if os.path.exists(file_full_path):
        return file_full_path
    else:
        return False


def upload_file(file_path, f):
    return_status = {'url': '', 'width': '', 'height': ''}
    fs = FileSystemStorage(location=file_path)
    filename = fs.save(f.name.replace(' ', '_'), f)
    uploaded_file_url = '/' + file_path + '/' + filename
    return_status['url'] = uploaded_file_url
    file_full_path = settings.BASE_DIR + '/' + file_path + '/' + filename
    with Image.open(file_full_path) as img:
        width, height = img.size
    return_status['width'] = width
    return_status['height'] = height
    return_status['success'] = True
    return_status['filename'] = filename
    return  return_status