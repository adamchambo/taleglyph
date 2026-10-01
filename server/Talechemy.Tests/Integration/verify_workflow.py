"""Run against a disposable PostgreSQL-backed API. Creates isolated test worlds; deletes nothing.
Usage: TALECHEMY_TEST_API=http://127.0.0.1:5087/api python3 server/Talechemy.Tests/Integration/verify_workflow.py
"""
import base64
import copy
import json
import os
import urllib.error
import urllib.request
import uuid

BASE = os.environ['TALECHEMY_TEST_API'].rstrip('/')

def call(path, data=None, method=None, status=200, content_type='application/json'):
    body = data if isinstance(data, bytes) else json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(BASE + path, data=body, method=method, headers={'Content-Type': content_type})
    try:
        response = urllib.request.urlopen(request)
    except urllib.error.HTTPError as error:
        response = error
    raw = response.read()
    assert response.status == status, (path, response.status, raw.decode(errors='replace'))
    return json.loads(raw) if raw and 'json' in response.headers.get('Content-Type', '') else raw


def upload(world, name='Test image'):
    boundary = 'test-' + uuid.uuid4().hex
    png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ZkAAAAASUVORK5CYII=')
    body = b''
    for key, value in [('worldId', world), ('name', name)]:
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode()
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + png + f'\r\n--{boundary}--\r\n'.encode()
    return call('/assets/upload', body, content_type='multipart/form-data; boundary=' + boundary)


def run():
    world = call('/worlds', {'name': 'Workflow check ' + uuid.uuid4().hex[:6], 'theme': 'fantasy'}, status=201)
    story = call('/manuscripts/stories', {'worldId': world['id'], 'title': 'The Crossing'})
    chapter = call('/manuscripts/stories/' + story['id'] + '/chapters', {'title': 'The gate'})
    scenes = [call('/manuscripts/chapters/' + chapter['id'] + '/scenes', {'title': name, 'prose': 'Original ' + name}) for name in ['Arrival', 'Departure']]
    endpoint = '/adaptations/chapters/' + chapter['id']
    # Invalid selections leave no partial comic.
    call(endpoint, {'title': 'Invalid', 'sceneIds': [scenes[0]['id'], scenes[0]['id']]}, status=400)
    call(endpoint, {'title': 'Invalid', 'sceneIds': [str(uuid.uuid4())]}, status=400)
    assert call('/comics?storyId=' + story['id']) == []
    comic = call(endpoint, {'title': 'The gate — comic', 'sceneIds': [scenes[1]['id'], scenes[0]['id']], 'panelCount': 2})
    workspace = call('/adaptations/comics/' + comic['id'])
    assert [p['source']['sceneId'] for p in workspace['pages']] == [s['id'] for s in scenes]
    assert len(workspace['pages'][0]['panels']) == 2
    asset = upload(world['id'])
    assert call('/assets/' + asset['id'] + '/image').startswith(b'\x89PNG')
    page = workspace['pages'][0]
    page['panels'][0]['layers'] = [dict(name='Artwork', kind='Image', x=12, y=18, width=60, assetId=asset['id'], visible=True, locked=True), dict(name='Speech', kind='Text', x=5, y=5, width=70, text='We have arrived.', visible=True, locked=False)]
    saved = call('/adaptations/pages/' + page['id'], page, 'PUT')
    assert saved['revision'] == 2
    assert saved['panels'] == call('/adaptations/comics/' + comic['id'])['pages'][0]['panels']
    call('/adaptations/pages/' + page['id'], page, 'PUT', status=409)
    foreign = call('/worlds', {'name': 'Separate world', 'theme': 'fantasy'}, status=201)
    other_asset = upload(foreign['id'])
    invalid = copy.deepcopy(saved)
    invalid['panels'][0]['layers'][0]['assetId'] = other_asset['id']
    call('/adaptations/pages/' + page['id'], invalid, 'PUT', status=400)
    assert call('/adaptations/comics/' + comic['id'])['pages'][0]['panels'] == saved['panels']
    template = call('/adaptations/pages/' + page['id'] + '/templates', {'title': 'Two-panel artwork', 'revision': saved['revision']})
    second = call(endpoint, {'title': 'Template adaptation', 'sceneIds': [scenes[1]['id']], 'templateId': template['id']})
    second_page = call('/adaptations/comics/' + second['id'])['pages'][0]
    assert second_page['panels'] == saved['panels'] and second_page['id'] != saved['id']
    second_page['panels'][0]['layers'][1]['text'] = 'Independent edit'
    call('/adaptations/pages/' + second_page['id'], second_page, 'PUT')
    assert call('/adaptations/comics/' + comic['id'])['pages'][0]['panels'] == saved['panels']
    foreign_story = call('/manuscripts/stories', {'worldId': foreign['id'], 'title': 'Other'})
    foreign_chapter = call('/manuscripts/stories/' + foreign_story['id'] + '/chapters', {'title': 'Other'})
    foreign_scene = call('/manuscripts/chapters/' + foreign_chapter['id'] + '/scenes', {'title': 'Other'})
    call('/adaptations/chapters/' + foreign_chapter['id'], {'title': 'Wrong template', 'sceneIds': [foreign_scene['id']], 'templateId': template['id']}, status=400)
    source = scenes[0]
    original = source['prose']
    source['prose'] = 'The novel changed.'
    call('/manuscripts/scenes/' + source['id'], source, 'PUT')
    call('/manuscripts/scenes/' + source['id'], source, 'PUT', status=409)
    changed = call('/adaptations/comics/' + comic['id'])['pages'][0]
    assert changed['source']['needsReview'] and changed['source']['originalProse'] == original
    assert changed['source']['currentProse'] == source['prose'] and changed['panels'] == saved['panels']
    call('/adaptations/pages/' + page['id'] + '/review?revision=1', method='POST', status=409)
    call('/adaptations/pages/' + page['id'] + '/review?revision=2', method='POST', status=204)
    reviewed = call('/adaptations/comics/' + comic['id'])['pages'][0]
    assert not reviewed['source']['needsReview'] and reviewed['source']['originalProse'] == original
    print('PASS: ordered selection, atomic rejection, image upload, page persistence, independent template reuse, foreign-world rejection, stale writes, source revisions and review acknowledgement.')
    print('Verified comic: ' + comic['id'])

if __name__ == '__main__':
    run()
