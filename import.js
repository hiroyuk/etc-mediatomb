// Default MediaTomb import script.
// see MediaTomb scripting documentation for more information

/*MT_F*
    
    MediaTomb - http://www.mediatomb.cc/
    
    import.js - this file is part of MediaTomb.
    
    Copyright (C) 2006-2009 Gena Batyan <bgeradz@mediatomb.cc>,
                            Sergey 'Jin' Bostandzhyan <jin@mediatomb.cc>,
                            Leonhard Wimmer <leo@mediatomb.cc>
    
    This file is free software; the copyright owners give unlimited permission
    to copy and/or redistribute it; with or without modifications, as long as
    this notice is preserved.
    
    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    
    $Id: import.js 2010 2009-01-11 19:10:43Z lww $
*/

function addAudio(obj)
{
    var desc = '';
    var artist_full;
    var album_full;
    
    // first gather data
    var title = obj.meta[M_TITLE];
    if (!title) title = obj.title;
    
    var artist = obj.meta[M_ARTIST];
    if (!artist) 
    {
        artist = 'Unknown';
        artist_full = null;
    }
    else
    {
        artist_full = artist;
        desc = artist;
    }
    
    var album = obj.meta[M_ALBUM];
    if (!album) 
    {
        album = 'Unknown';
        album_full = null;
    }
    else
    {
        desc = desc + ', ' + album;
        album_full = album;
    }
    
    if (desc)
        desc = desc + ', ';
    
    desc = desc + title;
    
    var date = obj.meta[M_DATE];
    if (!date)
    {
        date = 'Unknown';
    }
    else
    {
        date = getYear(date);
        desc = desc + ', ' + date;
    }
    
    var genre = obj.meta[M_GENRE];
    if (!genre)
    {
        genre = 'Unknown';
    }
    else
    {
        desc = desc + ', ' + genre;
    }
    
    var description = obj.meta[M_DESCRIPTION];
    if (!description) 
    {
        obj.meta[M_DESCRIPTION] = desc;
    }

// uncomment this if you want to have track numbers in front of the title
// in album view
    
/*    
    var track = obj.meta[M_TRACKNUMBER];
    if (!track)
        track = '';
    else
    {
        if (track.length == 1)
        {
            track = '0' + track;
        }
        track = track + ' ';
    }
*/
    // comment the following line out if you uncomment the stuff above  :)
    var track = '';

    var chain = new Array('Audio', 'All Audio');
    obj.title = title;
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'Artists', artist, 'All Songs');
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'All - full name');
    var temp = '';
    if (artist_full)
        temp = artist_full;
    
    if (album_full)
        temp = temp + ' - ' + album_full + ' - ';
    else
        temp = temp + ' - ';
   
    obj.title = temp + title;
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'Artists', artist, 'All - full name');
    addCdsObject(obj, createContainerChain(chain));
    
    chain = new Array('Audio', 'Artists', artist, album);
    obj.title = track + title;
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER_MUSIC_ALBUM);
    
    chain = new Array('Audio', 'Albums', album);
    obj.title = track + title; 
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER_MUSIC_ALBUM);
    
    chain = new Array('Audio', 'Genres', genre);
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER_MUSIC_GENRE);
    
    chain = new Array('Audio', 'Year', date);
    addCdsObject(obj, createContainerChain(chain));
}

function addVideo(obj)
{
    var chain = new Array('Video - Year');
    var chain2 = new Array('Video - Title');
    var desc = obj.location;
    var path = desc.split('/');

    while(path.length > 0) {
	var key = path.shift();
	if (key == 'movie') {
	    // .../movie/0000xQ foo bar/#01 foo.mp4
	    // m : ['0000xQ', 'foo', 'bar']
	    // path : ['#01 foo.mp4']
	    var m = path.shift().split(' ');
	    // year : '0000xQ'
	    var year = m.shift();
	    // title : 'foo bar'
	    var title = m.join(' ');
	    if (year.length == 6) {
		chain.push(year.substring(0,4));
		chain.push(year.substring(4,6));
	    } else {
		chain.push(year);
	    }

	    if (title.length > 0) {
		chain.push(title);
		if (title.charCodeAt(0) < 127) {
		    chain2.push(title.substring(0, 1));
		} else {
		    chain2.push(title.substring(0, 3));
		}
		chain2.push(title);

		addCdsObject(obj, createContainerChain(chain));
		addCdsObject(obj, createContainerChain(chain2));
	    }
	    break;
	}
	if (key == 'movie_tmp') {
	    path.unshift('tmp');
	    path.pop();
	    chain = chain.concat(path);

	    addCdsObject(obj, createContainerChain(chain));
	    break;
	}
	if (key == 'photo') {
	    path.unshift('camera');
	    path.pop();

	    chain = chain.concat(path);
	    addCdsObject(obj, createContainerChain(chain));
	    break;
	}
    }
/*
    if (path.length > 4) {
	var array = path.slice(4);
	if (path[3] == 'movie') {
	    // /home/public/movie/xxxxyQ title/xxxx.mp4
	    var title = array[0].split(' ');
	    chain.push(title.shift());
	    if (title.length > 0) {
		chain.push(title.join(' '));
	    }
	} else if (path[3] == 'movie_tmp') {
            // /home/public/movie_tmp/xxxx.ts
	    chain.push('99990Q recorded');
            for (var k=0; k<array.length-1; k++) {
                chain.push(array[k]);
	    }
	}
    } else {
	chain.push(desc);
    }
*/
}

function addWeborama(obj)
{
    var req_name = obj.aux[WEBORAMA_AUXDATA_REQUEST_NAME];
    if (req_name)
    {
        var chain = new Array('Online Services', 'Weborama', req_name);
        addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_PLAYLIST_CONTAINER);
    }
}

function addImage(obj)
{
    var chain = new Array('Photos', 'All Photos');
    addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER);

    var date = obj.meta[M_DATE];
    if (date)
    {
        chain = new Array('Photos', 'Date', date);
        addCdsObject(obj, createContainerChain(chain), UPNP_CLASS_CONTAINER);
    }

    var last_path = getLastPath(obj.location);
    if (last_path)
    {
        chain = new Array('Photos', 'Directories', last_path);
        addCdsObject(obj, createContainerChain(chain));
    }
}


function addYouTube(obj)
{
    var chain;

    var temp = parseInt(obj.aux[YOUTUBE_AUXDATA_AVG_RATING], 10);
    if (temp != Number.NaN)
    {
        temp = Math.round(temp);
        if (temp > 3)
        {
            chain = new Array('Online Services', 'YouTube', 'Rating', 
                                  temp.toString());
            addCdsObject(obj, createContainerChain(chain));
        }
    }

    temp = obj.aux[YOUTUBE_AUXDATA_REQUEST];
    if (temp)
    {
        var subName = (obj.aux[YOUTUBE_AUXDATA_SUBREQUEST_NAME]);
        var feedName = (obj.aux[YOUTUBE_AUXDATA_FEED]);
        var region = (obj.aux[YOUTUBE_AUXDATA_REGION]);

            
        chain = new Array('Online Services', 'YouTube', temp);

        if (subName)
            chain.push(subName);

        if (feedName)
            chain.push(feedName);

        if (region)
            chain.push(region);

        addCdsObject(obj, createContainerChain(chain));
    }
}

function addTrailer(obj)
{
    var chain;

    chain = new Array('Online Services', 'Apple Trailers', 'All Trailers');
    addCdsObject(obj, createContainerChain(chain));

    var genre = obj.meta[M_GENRE];
    if (genre)
    {
        genres = genre.split(', ');
        for (var i = 0; i < genres.length; i++)
        {
            chain = new Array('Online Services', 'Apple Trailers', 'Genres',
                              genres[i]);
            addCdsObject(obj, createContainerChain(chain));
        }
    }

    var reldate = obj.meta[M_DATE];
    if ((reldate) && (reldate.length >= 7))
    {
        chain = new Array('Online Services', 'Apple Trailers', 'Release Date',
                          reldate.slice(0, 7));
        addCdsObject(obj, createContainerChain(chain));
    }

    var postdate = obj.aux[APPLE_TRAILERS_AUXDATA_POST_DATE];
    if ((postdate) && (postdate.length >= 7))
    {
        chain = new Array('Online Services', 'Apple Trailers', 'Post Date',
                          postdate.slice(0, 7));
        addCdsObject(obj, createContainerChain(chain));
    }
}

// main script part

if (getPlaylistType(orig.mimetype) == '')
{
    var arr = orig.mimetype.split('/');
    var mime = arr[0];
    
    var obj = orig; 
    obj.refID = orig.id;
    
    if (mime == 'audio')
    {
        if (obj.onlineservice == ONLINE_SERVICE_WEBORAMA)
            addWeborama(obj);
        else
            addAudio(obj);
    }
    
    if (mime == 'video')
    {
        if (obj.onlineservice == ONLINE_SERVICE_YOUTUBE)
            addYouTube(obj);
        else if (obj.onlineservice == ONLINE_SERVICE_APPLE_TRAILERS)
            addTrailer(obj);
        else
            addVideo(obj);
    }
    
    if (mime == 'image')
    {
        addImage(obj);
    }

    if (orig.mimetype == 'application/ogg')
    {
        if (orig.theora == 1)
            addVideo(obj);
        else
            addAudio(obj);
    }
}
