"""Library API acceptance against a disposable PostgreSQL database; creates isolated content."""
from verify_workflow import call, upload
import uuid

def run():
    name='Library '+uuid.uuid4().hex[:8]
    story=call('/library/stories', {'title':name}, status=201)
    assert story['spaceName']==name and story['chapterCount']==0 and story['tags']==[]
    sid=story['id']; space=story['spaceId']; path='/library/stories/'+sid
    assert call(path)['id']==sid
    spin=call('/library/stories', {'title':'Spin-off','spaceId':space,'overview':'Shared world, independent plot','tags':['Fantasy','Hopeful'],'startingSection':'comic'}, status=201)
    assert spin['spaceId']==space and spin['startingSection']=='comic'
    series=call('/library/series',{'spaceId':space,'name':'The gate cycle'})
    asset=upload(space)
    update=dict(title=name,spaceId=space,overview='A changed overview',tags=['Fantasy','fantasy','Hopeful'],seriesId=series['id'],coverAssetId=asset['id'],revision=story['revision'],startingSection='characters')
    saved=call(path,update,'PUT')
    assert saved['revision']==2 and saved['seriesName']=='The gate cycle' and saved['tags']==['Fantasy','Hopeful']
    call(path,update,'PUT',status=409)
    foreign=call('/library/stories',{'title':'Other space'},status=201)
    call('/library/stories/'+foreign['id'],dict(title='Invalid cover',coverAssetId=asset['id']),'PUT',status=400)
    call('/library/stories/'+foreign['id'],dict(title='Invalid series',seriesId=series['id']),'PUT',status=400)
    call(path,dict(update,revision=2,spaceId=foreign['spaceId']),'PUT',status=400)
    comic=call('/library/stories/'+spin['id']+'/comics',{'title':'No novel needed'})
    work=call('/adaptations/comics/'+comic['id'])
    assert len(work['pages'])==1 and len(work['pages'][0]['panels'])==3 and work['pages'][0]['source'] is None
    assert call('/library/context/comic/'+comic['id'])['storyId']==spin['id']
    assert call('/library/stories/'+spin['id'])['chapterCount']==0
    snapshot=call('/library')
    assert any(s['id']==sid and s['coverAssetId']==asset['id'] for s in snapshot['stories'])
    call('/library/stories',{'title':'   '},status=400)
    call('/library/stories',{'title':'Bad tags','tags':[None]},status=400)
    print('PASS: name-only onboarding, shared-space spin-off, tags, series, cover, stale writes, cross-space validation, library queries and direct comic creation.')
if __name__=='__main__':run()
